const API_URL_ARTICULO = "http://localhost:8080/api/articulos";

document.addEventListener("DOMContentLoaded", listaDeArticulos);
document.addEventListener("DOMContentLoaded",actualizarIconCarrito);

function listaDeArticulos() {
    fetch(API_URL_ARTICULO)
        .then(response => response.json())
        .then(data => {
            const container = document.querySelector(".container-articles");
            container.innerHTML = '';
            data.forEach(articulo => {
                const card = document.createElement("div");
                card.classList.add("card-article");
                card.innerHTML = `
                    <img src="/assets/img/${articulo.imagen}" alt="${articulo.nombre}">
                    <h3>${articulo.nombre}</h3>
                    <p>Precio: ${articulo.precio.toFixed(2)}</p>
                    <button class="btn-carrito" onclick="agregarArticuloAlCarrito(${articulo.id})">
                        <span class="carrito-icon"></span>
                    </button>
                `;
                document.querySelector(".container-articles").appendChild(card);
            });
        })
        .catch(error => console.error("Error al listar artículos:", error));
}

function agregarArticuloAlCarrito(id) {
    //1 cargar carrito existente
    carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    // 2. Agregar nuevo ID
    carrito.push(id.toString());
    // 3. Guardar
    localStorage.setItem('carrito', JSON.stringify(carrito));
    // 4. Feedback visual
    mostrarModalAlert('¡ Producto agregado al carrito con exito !');
    actualizarIconCarrito() // Mostrar punto rojo
}

function actualizarIconCarrito() {
    carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const icon = document.querySelector('.icono-nav-carrito');
    
    if (carrito.length > 0) {
        icon.src = '../assets/img/carrito-lleno.png';
    } else {
        icon.src = '../assets/img/carrito-vacio.png';
    }
}

function mostrarModalAlert(mensaje) {
  const modalElement = document.getElementById('customAlertModal');
  const modalMessage = document.getElementById('alertMessage');
  const modalBackdrop = document.getElementById('modalBackdrop');
  
  // Configurar el mensaje
  modalMessage.textContent = mensaje;
  
  // Mostrar el backdrop difuminado
  modalBackdrop.style.display = 'block';
  
  // Configurar el modal
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
  
  // Ocultar el backdrop cuando se cierre el modal
  modalElement.addEventListener('hidden.bs.modal', function () {
    modalBackdrop.style.display = 'none';
  });
}