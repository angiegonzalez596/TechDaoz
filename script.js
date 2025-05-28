// Tu JavaScript personalizado irá aquí
console.log("¡Proyecto cargado!");
// Cargar productos desde API y mostrar
fetch('http://localhost:3000/productos')
.then(response => response.json())
.then(productos => {
  const contenedor = document.getElementById('contenedor-productos');
  contenedor.innerHTML = '';
  productos.forEach(producto => {
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
            <a href="#" class="btn btn-outline-primary btn-sm">Añadir al carrito</a>
          </div>
        </div>
      </div>
    `;
  });
});

document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3000/productos-populares')
    .then(response => response.json())
    .then(productos => {
      const contenedor = document.getElementById('productos-populares');
      contenedor.innerHTML = '';
      productos.forEach(producto => {
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
                <a href="#" class="btn btn-outline-primary btn-sm">Añadir al carrito</a>
              </div>
            </div>
          </div>
        `;
      });
    })
    .catch(error => console.error('Error al obtener productos populares:', error));
});


// Filtro por categoría
document.getElementById("categoriaSelect").addEventListener("change", function () {
const seleccion = this.value;
const productos = document.querySelectorAll('#contenedor-productos .col');

productos.forEach(function (producto) {
  const categoria = producto.dataset.categoria;

  if (seleccion === "todos" || categoria === seleccion) {
    producto.style.display = "block";
  } else {
    producto.style.display = "none";
  }
});
});

// Validación del formulario
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', function(event) {
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
    
    // Animación para las tarjetas de información
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