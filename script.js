// Tu JavaScript personalizado irá aquí
console.log("¡Proyecto cargado!");

// Función para cargar y mostrar productos (reutilizable para la búsqueda)
function cargarProductos(apiUrl, contenedorId, searchTerm = '') {
    fetch(apiUrl)
        .then(response => response.json())
        .then(productos => {
            const contenedor = document.getElementById(contenedorId);
            contenedor.innerHTML = ''; // Limpiar el contenedor antes de añadir nuevos productos

            // Filtrar productos si hay un término de búsqueda
            const productosFiltrados = productos.filter(producto => {
                if (!searchTerm) {
                    return true; // Si no hay término de búsqueda, mostrar todos
                }
                // Convertir a minúsculas para una búsqueda sin distinción de mayúsculas/minúsculas
                const nombreProducto = producto.nombre.toLowerCase();
                const descripcionProducto = (producto.descripcion || '').toLowerCase();
                const categoriaProducto = (producto.categoria || '').toLowerCase();
                const term = searchTerm.toLowerCase();

                // Buscar en nombre, descripción y categoría
                return nombreProducto.includes(term) ||
                    descripcionProducto.includes(term) ||
                    categoriaProducto.includes(term);
            });

            if (productosFiltrados.length === 0 && searchTerm) {
                // Si no hay resultados para la búsqueda, mostrar un mensaje
                contenedor.innerHTML = `<div class="col-12 text-center my-5">
                                            <p class="lead">No se encontraron resultados para "${searchTerm}".</p>
                                        </div>`;
            } else {
                productosFiltrados.forEach(producto => {
                    contenedor.innerHTML += `
                        <div class="col" data-categoria="${producto.categoria || ''}">
                            <div class="card h-100 d-flex flex-column shadow-sm">
                                <img src="imagenes/${producto.imagen}" class="card-img-top" alt="${producto.nombre}" />
                                <div class="card-body">
                                    <h5 class="card-title">${producto.nombre}</h5>
                                    <button class="btn btn-warning btn-sm mb-2" onclick="this.nextElementSibling.classList.toggle('d-none')">Ver más</button>
                                    <div class="descripcion-producto d-none">${producto.descripcion || 'Sin descripción'}</div>
                                </div>
                                <div class="card-footer d-flex justify-content-between align-items-center">
                                    <span class="fw-bold">$${producto.precio.toLocaleString('es-CO')}</span>
                                     <a  class="btn btn-outline-primary btn-sm"  onclick='addCar(${JSON.stringify(producto).replace(/'/g, "&#39;")})'>Añadir al carrito</a>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
        })
        .catch(error => console.error(`Error al obtener productos de ${apiUrl}:`, error));
}
//  <a href="#" class="btn btn-outline-primary btn-sm">Añadir al carrito</a>

// --- Lógica principal al cargar el DOM ---
document.addEventListener('DOMContentLoaded', () => {
    // Obtener el término de búsqueda de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchTermFromUrl = urlParams.get('q'); // 'q' es el nombre del input del formulario

    // Cargar productos del catálogo, aplicando el término de búsqueda si existe
    // Si la página es catalogo.html, se asume que 'contenedor-productos' es el principal
    cargarProductos('http://localhost:3000/productos', 'contenedor-productos', searchTermFromUrl);

    // Cargar productos populares (sin filtro inicial por búsqueda)
    // Asumiendo que 'productos-populares' es un bloque separado y no debe ser afectado por la búsqueda principal
    cargarProductos('http://localhost:3000/productos-populares', 'productos-populares');


    // --- Filtro por categoría (ya existente, asegúrate de que funciona con la nueva estructura) ---
    const categoriaSelect = document.getElementById("categoriaSelect");
    if (categoriaSelect) { // Asegúrate de que el elemento exista en la página
        categoriaSelect.addEventListener("change", function () {
            const seleccion = this.value;
            const productos = document.querySelectorAll('#contenedor-productos .col'); // Solo afecta al contenedor principal

            productos.forEach(function (producto) {
                const categoria = producto.dataset.categoria;

                if (seleccion === "todos" || categoria === seleccion) {
                    producto.style.display = "block";
                } else {
                    producto.style.display = "none";
                }
            });
        });
    }


    // --- Validación del formulario de contacto (ya existente) ---
    const form = document.getElementById('contactForm');
    if (form) { // Asegúrate de que el formulario de contacto exista en la página actual
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                // Simular envío (en producción quitar esto y dejar que el form se envíe)
                event.preventDefault();
                alert('Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.');
                form.reset();
                form.classList.remove('was-validated');
            }
            form.classList.add('was-validated');
        }, false);
    }

    // Animación para las tarjetas de información (ya existente)
    const infoCards = document.querySelectorAll('.contact-info-card');
    infoCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
});

// // Primero creamos el array global
// window.productosCarrito = [];


// // Modificamos la función addCar
// function addCar(producto) {
//     // Agregamos el producto al array global
//     window.productosCarrito.push(producto);

//     // Mostramos el producto que se acaba de agregar
//     console.log("Producto recién agregado:", producto);

//     // Mostramos la lista completa
//     console.log("Lista completa de productos en el carrito:", window.productosCarrito);

// }

// En script.js
// Inicializamos el array
if (!localStorage.getItem('productosCarrito')) {
    localStorage.setItem('productosCarrito', JSON.stringify([]));
}

function addCar(producto) {
    // Obtenemos el array actual
    let productosCarrito = JSON.parse(localStorage.getItem('productosCarrito')) || [];

    // Agregamos el producto
    productosCarrito.push(producto);

    // Guardamos el array actualizado
    localStorage.setItem('productosCarrito', JSON.stringify(productosCarrito));

    // Mostramos en consola
    console.log("Producto recién agregado:", producto);
    console.log("Lista completa de productos en el carrito:", productosCarrito);
}

// function addCar(producto) {
//     let productosCarrito = JSON.parse(localStorage.getItem('productosCarrito')) || [];

//     // Verificar si el producto ya está en el carrito
//     const productoExistente = productosCarrito.findIndex(p => p.id === producto.id);
//         console.log("producto ex",productoExistente);

//     if (productoExistente !== -1) {
//         console.log("aca entra 1");

//         // Si el producto ya existe, aumentar su cantidad
//         if (!productosCarrito[productoExistente].cantidad) {
//             console.log("aca entra 2");

//             productosCarrito[productoExistente].cantidad = 1;
//         }
//         productosCarrito[productoExistente].cantidad++;
//     } else {
//         console.log("aca entra 3");

//         // Si el producto no existe, agregarlo con cantidad 1
//         producto.cantidad = 1;
//         productosCarrito.push(producto);
//     }

//     localStorage.setItem('productosCarrito', JSON.stringify(productosCarrito));

//     // Mostrar mensaje de confirmación
//     // alert(`¡${producto.nombre} agregado al carrito!`);
//     // Mostramos en consola
//     console.log("Producto recién agregado:", producto);
//     console.log("Lista completa de productos en el carrito:", productosCarrito);
// }