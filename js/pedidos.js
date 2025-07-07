const API_URL_PEDIDO = "http://localhost:8080/api/pedidos";

document.addEventListener("DOMContentLoaded", listarPedidos);

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("form-pedido").addEventListener("submit", guardarPedido);
    document.getElementById("cancelar").addEventListener("click", limpiarFormularioPedido);
    listarPedidos(); // Cargar datos al iniciar
});

function listarPedidos() {
    fetch(API_URL_PEDIDO)
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById("tabla-pedido"); // Obtenemos el cuerpo de la tabla
            tbody.innerHTML = ""; // Limpiar tabla antes de insertar nuevos datos
            data.forEach(pedido => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                        <td>${pedido.id}</td>
                        <td>${pedido.dniCliente}</td>
                        <td>${pedido.total.toFixed(2)}</td>
                        <td>${pedido.fecha}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="editarPedido(${pedido.id})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarPedido(${pedido.id})">Eliminar</button>
                        </td>
                    `;
                tbody.appendChild(fila)
            })
        })
        .catch(error => console.error("Error al listar Pedidos:", error)); // Manejo de errores
}

function guardarPedido(event) {
    event.preventDefault(); // Evitamos el comportamiento por defecto del formulario

    // Obtenemos los valores de los campos del formulario
    const id = document.getElementById("idPedido").value;
    const dniCliente = document.getElementById("dniCliente").value.trim();
    const total = parseFloat(document.getElementById("total").value);
    const fecha = new Date().toISOString().split('T')[0];
    // Validación de campos
    if (!dniCliente || isNaN(total) || total < 0) {
        alert("Por favor complete correctamente los campos.");
        return;
    }

    // Creamos un objeto artículo con los datos del formulario
    const pedido = { dniCliente, total, fecha };
    // Determinamos si es una edición (PUT) o creación (POST)
    const url = id ? `${API_URL_PEDIDO}/${id}` : API_URL_PEDIDO;
    const metodo = id ? "PUT" : "POST";

    // Enviamos el artículo al backend usando fetch
    fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" }, // Indicamos que el cuerpo es JSON
        body: JSON.stringify(pedido) // Convertimos el objeto a JSON
    })
        .then(response => {
            if (!response.ok) throw new Error("Error al guardar"); // Verificamos respuesta exitosa
            return response.json();
        })
        .then(() => {
            // Limpiamos el formulario y recargamos la tabla
            document.getElementById("form-pedido").reset();
            document.getElementById("idPedido").value = "";
            listarPedidos();
        })
        .catch(error => console.error("Error al guardar pedido:", error)); // Manejo de errores
}

function editarPedido(id) {
    // Llamada GET para obtener los datos del artículo por su ID
    fetch(`${API_URL_PEDIDO}/${id}`)
        .then(response => response.json()) // Convertimos la respuesta a JSON
        .then(pedido => {
            // Cargamos los datos del artículo en el formulario
            document.getElementById("idPedido").value = pedido.id;
            document.getElementById("dniCliente").value = pedido.dniCliente;
            document.getElementById("total").value = pedido.total;
        })
        .catch(error => console.error("Error al obtener Pedido:", error)); // Manejo de errores
}

function eliminarPedido(id) {
    // Confirmación antes de eliminar
    if (confirm("¿Deseás eliminar este pedido?")) {
        // Llamada DELETE al backend
        fetch(`${API_URL_PEDIDO}/${id}`, {
            method: "DELETE"
        })
            .then(response => {
                if (!response.ok) throw new Error("Error al eliminar"); // Verificamos que la respuesta sea exitosa
                listarPedidos(); // Actualizamos la lista de artículos
            })
            .catch(error => console.error("Error al eliminar pedido:", error)); // Manejo de errores
    }
}

function limpiarFormularioPedido() {
    document.getElementById("idPedido").value = "";
    document.getElementById("dniCliente").value = "";
    document.getElementById("total").value = "";
}