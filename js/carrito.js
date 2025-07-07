const API_URL_ARTICULO = "http://localhost:8080/api/articulos";
const API_URL_PEDIDO = "http://localhost:8080/api/pedidos";
let carrito = [];

document.addEventListener("DOMContentLoaded", renderCarrito);
//vaciar carrito
document.getElementById("vaciar-carrito").addEventListener("click", vaciarCarrito);
document.getElementById("comprar").addEventListener("click", armarPedido);
document.getElementById("cancelar").addEventListener("click", cancelarPedido);

// Asignar el evento al formulario (que ya existe en el DOM)
document.getElementById("form-pedido").addEventListener("submit", function(e) {
    e.preventDefault(); // Evita que el formulario se envíe tradicionalmente

    // Verifica si el botón clickeado es "Realizar Pedido" (por clase o ID)
    if (e.submitter.classList.contains("btn-realizar-pedido")) {
        guardarPedido(); // Ejecuta tu función
    }
});

function mostrarModalAlert(mensaje) {
  const modalElement = document.getElementById('customAlertModal');
  const modalMessage = document.getElementById('alertMessage');
  
  if (!modalElement || !modalMessage) {
    console.error("No se encontró el modal o el mensaje");
    return;
  }

  // Configurar el mensaje
  modalMessage.textContent = mensaje;
  
  // Mostrar el modal (Bootstrap 5)
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

async function renderCarrito() {
    const lista = document.getElementById("lista-carrito");
    const totalElement = document.getElementById("total");
    
    // 1. Limpiar y mostrar loader
    lista.innerHTML = '<div class="text-center">Cargando carrito...</div>';
    totalElement.textContent = '$0.00';

    // 2. Obtener carrito del localStorage
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    if (carrito.length === 0) {
        lista.innerHTML = '<p class="text-muted p-carrito">¡ Tu carrito está vacío !</p>';
        document.getElementById("vaciar-carrito").style.display = "none";
        return;
    }

    try {
        // 3. Hacer todas las peticiones en paralelo
        const articulos = await Promise.all(
            carrito.map(id => 
                fetch(`${API_URL_ARTICULO}/${id}`)
                    .then(response => response.json())
            )
        );

        // 4. Renderizar artículos y calcular total
        lista.innerHTML = '';
        let precioTotal = 0;

        articulos.forEach(articulo => {
            const card = document.createElement("div");
            card.classList.add("card-article-carrito");
            card.innerHTML = `
                <img src="/assets/img/${articulo.imagen}" alt="${articulo.nombre}">
                <h3>${articulo.nombre}</h3>
                <p>Precio: $${articulo.precio.toFixed(2)}</p>
                <button class="btn btn-danger btn-sm" onclick="eliminarArticuloDelCarrito(${articulo.id})">Eliminar</button>
            `;
            lista.appendChild(card);
            precioTotal += articulo.precio;
        });

        // 5. Actualizar total (¡ahora sí con el valor correcto!)
        totalElement.textContent = `$${precioTotal.toFixed(2)}`;

    } catch (error) {
        console.error("Error al cargar el carrito:", error);
        lista.innerHTML = '<p class="text-danger">Error al cargar el carrito</p>';
    }
}

function eliminarArticuloDelCarrito(id) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carrito.filter(itemId => itemId !== id.toString()); // Convertir a string por seguridad
    if (carrito.length === 0) {
        localStorage.removeItem('carrito');
    }else{
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }
    renderCarrito();
}

function vaciarCarrito(){
    localStorage.removeItem('carrito');
    carrito = [];
    renderCarrito();
}

function armarPedido() {
    carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carrito.length > 0) {
        document.querySelector(".container-form").classList.remove("d-none"); //muestra el formulario
        const formContainer = document.querySelector(".container-form"); // Obtiene el contenedor del formulario
        formContainer.scrollIntoView({ behavior: "smooth" }); // Desplazamiento suave
        //total del carrito
        let totalCarrito = document.getElementById("total"); // <span>$0.00</span>
        let valorNumerico = totalCarrito.textContent.replace('$', '').trim();
        let totalInput = document.getElementById("total-pedido"); // <input id="total-pedido">
        totalInput.value = valorNumerico;    
    }else{
        mostrarModalAlert('⚠️ No hay artículos en el carrito.');
    }
}

function guardarPedido() {
    const id = document.getElementById("idPedido").value;
    const dniCliente = document.getElementById("dniCliente").value.trim();
    const fecha = new Date().toISOString().split('T')[0];
    const total = parseFloat(document.getElementById("total-pedido").value);

    // Validación
    if (!dniCliente || isNaN(total) || total <= 0) {
        mostrarModalAlert('⚠️ Por favor complete correctamente los campos.');
        return;
    }

    const pedido = { dniCliente, total, fecha };
    const url = id ? `${API_URL_PEDIDO}/${id}` : API_URL_PEDIDO;
    const metodo = id ? "PUT" : "POST";

    fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
    })
    .then(response => {
        if (!response.ok) throw new Error("Error al guardar");
        return response.json();
    })
    .then(() => {
        document.getElementById("form-pedido").reset();
        mostrarModalAlert('✅ ¡Pedido realizado con éxito!');
    })
    .catch(error => {
        console.error("Error:", error);
        mostrarModalAlert('❌ Error al guardar el pedido');
    });
    document.querySelector(".container-form").classList.add("d-none");
    vaciarCarrito();
}

function cancelarPedido(){
    document.querySelector(".container-form").classList.add("d-none");
    document.getElementById("form-pedido").reset();
}