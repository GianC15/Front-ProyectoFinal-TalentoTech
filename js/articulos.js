// URL base de la API
const API_URL_ARTICULO = "http://localhost:8080/api/articulos";


// Cuando se carga la página, mostramos los listados
document.addEventListener("DOMContentLoaded", listarArticulos);

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("form-articulo").addEventListener("submit", guardarArticulo);
    document.getElementById("cancelar").addEventListener("click", limpiarFormularioArticulo);
    listarArticulos(); // Cargar datos al iniciar
});

// === Listar todos los artículos ===
function listarArticulos() {
    // Llamada GET a la API para obtener todos los artículos
    fetch(API_URL_ARTICULO)
        .then(response => response.json()) // Convertimos la respuesta a JSON
        .then(data => {
            const container = document.querySelector(".container-articles");
            container.innerHTML = ''; // <- Esta línea limpia todo el contenido
            data.forEach(articulo => {
                const card = document.createElement("div");
                card.classList.add("card-article");
                card.innerHTML = `
                    <img src="/assets/img/${articulo.imagen}" 
                    alt="${articulo.nombre}" </img>
                    <h3>${articulo.nombre}</h3>
                    <p>Precio: ${articulo.precio.toFixed(2)}</p>
                    <button class="btn btn-warning btn-sm" onclick="editarArticulo(${articulo.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarArticulo(${articulo.id})">Eliminar</button>
                `;
                document.querySelector(".container-articles").appendChild(card);
            });
        })
        .catch(error => console.error("Error al listar artículos:", error)); // Manejo de errores
}

// === Guardar o actualizar un artículo ===
function guardarArticulo(event) {
    event.preventDefault();

    // Obtener valores del formulario
    const id = document.getElementById("idArticulo").value;
    const nombre = document.getElementById("nombre").value.trim();
    const precio = parseFloat(document.getElementById("precio").value);
    const imagen = document.getElementById("imagen").files[0];

    //levanto el nombre de la imagen
    imagenNombre = imagen ? imagen.name : "";
    // Validación básica
    if (!nombre || isNaN(precio) || precio < 0) {
        alert("Por favor complete correctamente los campos.");
        return;
    }

    const articulo = { id, nombre, precio, imagen: imagenNombre };
    const url = id ? `${API_URL_ARTICULO}/${id}` : API_URL_ARTICULO;
    const metodo = id ? "PUT" : "POST";

    // Enviamos el artículo al backend usando fetch
    fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" }, // Indicamos que el cuerpo es JSON
        body: JSON.stringify(articulo) // Convertimos el objeto a JSON
    })
        .then(response => {
            if (!response.ok) throw new Error("Error al guardar"); // Verificamos respuesta exitosa
            return response.json();
        })
        .then(() => {
            // Limpiamos el formulario y recargamos la tabla
            document.getElementById("form-articulo").reset();
            document.getElementById("idArticulo").value = "";
            listarArticulos();
        })
        .catch(error => console.error("Error al guardar el artículo:", error)); // Manejo de errores
}

// === Cargar artículo en el formulario para edición ===
function editarArticulo(id) {
    // Llamada GET para obtener los datos del artículo por su ID
    fetch(`${API_URL_ARTICULO}/${id}`)
        .then(response => response.json()) // Convertimos la respuesta a JSON
        .then(articulo => {
            // Cargamos los datos del artículo en el formulario
            document.getElementById("idArticulo").value = articulo.id;
            document.getElementById("nombre").value = articulo.nombre;
            document.getElementById("precio").value = articulo.precio;
        })
        .catch(error => console.error("Error al obtener artículo:", error)); // Manejo de errores
}

// === Eliminar un artículo ===
function eliminarArticulo(id) {
    // Confirmación antes de eliminar
    if (confirm("¿Deseás eliminar este artículo?")) {
        // Llamada DELETE al backend
        fetch(`${API_URL_ARTICULO}/${id}`, {
            method: "DELETE"
        })
            .then(response => {
                if (!response.ok) throw new Error("Error al eliminar"); // Verificamos que la respuesta sea exitosa
                listarArticulos(); // Actualizamos la lista de artículos
            })
            .catch(error => console.error("Error al eliminar artículo:", error)); // Manejo de errores
    }
}

function limpiarFormularioArticulo() {
    document.getElementById("idArticulo").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("imagen").value = "";
}

