// pasarela/carrito.js

const stripe = Stripe('pk_test_tu_clave_publica_de_stripe'); // ¡CAMBIA ESTO!
let elements;
let currentCart = { items: [] }; // Almacenar el carrito actual

document.addEventListener('DOMContentLoaded', () => {
  // **Simulación de userId**
  // En una aplicación real, obtendrías el userId del usuario autenticado (ej. desde un JWT)
  const userId = '60c72b2f9b1d8e001c8a1b2c'; // Ejemplo de ID de usuario, reemplázalo con tu lógica de autenticación

  fetchCart(userId);

  document.getElementById('checkout-button').addEventListener('click', async () => {
    if (currentCart.items.length === 0) {
      alert('Tu carrito está vacío. Agrega productos antes de proceder al pago.');
      return;
    }

    const shippingAddress = {
      street: document.getElementById('street').value,
      city: document.getElementById('city').value,
      postalCode: document.getElementById('postalCode').value,
      country: document.getElementById('country').value,
    };

    // Validación básica de la dirección de envío
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      alert('Por favor, completa todos los campos de la dirección de envío.');
      return;
    }

    try {
      // 1. Crear el Payment Intent en el backend
      const response = await fetch('http://localhost:3000/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: currentCart.items, userId: userId, shippingAddress: shippingAddress }),
      });
      const { clientSecret } = await response.json();

      if (!clientSecret) {
        document.getElementById('payment-message').textContent = 'Error al inicializar el pago.';
        return;
      }

      // 2. Confirmar el pago con Stripe.js
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/pasarela/confirmacion.html`, // URL a donde redirigir después del pago
          shipping: { // Agrega información de envío aquí también
            name: 'Cliente Prueba', // Deberías obtener el nombre del usuario
            address: {
              line1: shippingAddress.street,
              city: shippingAddress.city,
              postal_code: shippingAddress.postalCode,
              country: 'CO', // Código de país ISO 3166-1 alpha-2
            },
          },
        },
      });

      if (error.type === "card_error" || error.type === "validation_error") {
        document.getElementById('payment-message').textContent = error.message;
      } else {
        document.getElementById('payment-message').textContent = "Ha ocurrido un error inesperado.";
      }
    } catch (error) {
      console.error('Error durante el proceso de pago:', error);
      document.getElementById('payment-message').textContent = 'Error al procesar el pago.';
    }
  });
});

async function fetchCart(userId) {
  try {
    const response = await fetch(`http://localhost:3000/cart/${userId}`);
    if (!response.ok) {
      if (response.status === 404) {
        // Carrito vacío o no encontrado, lo manejamos como un carrito vacío
        currentCart = { items: [] };
        displayCart();
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const cart = await response.json();
    currentCart = cart;
    displayCart();
    initializeStripeElements();
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    document.getElementById('cart-items-container').innerHTML = '<p class="text-center text-danger">Error al cargar el carrito. Inténtalo de nuevo más tarde.</p>';
    document.getElementById('cart-item-count').textContent = '0';
    updateTotals();
  }
}

function displayCart() {
  const container = document.getElementById('cart-items-container');
  container.innerHTML = ''; // Limpiar contenido anterior

  if (currentCart.items && currentCart.items.length === 0) {
    container.innerHTML = '<p class="text-center">Tu carrito está vacío.</p>';
    document.getElementById('cart-item-count').textContent = '0';
    updateTotals();
    return;
  }
  document.getElementById('empty-cart-message').classList.add('d-none'); // Oculta el mensaje de carrito vacío

  currentCart.items.forEach(item => {
    const itemHtml = `
      <div class="card mb-3 shadow-sm cart-item" data-product-id="<span class="math-inline">\{item\.productId\}"\>
      <div class="row g-0">
<div class="col-md-2">
<img src="../imagenes/{item.image}" class="img-fluid rounded-start p-2" alt="item.name"></div><divclass="col−md−10"><divclass="card−bodyd−flexjustify−content−betweenalign−items−center"><div><h5class="card−title">{item.name}</h5>
<p class="card-text text-muted">Precio: $item.price.toLocaleString( 
′
 es−CO 
′
 )</p></div><divclass="d−flexalign−items−center"><buttonclass="btnbtn−smbtn−outline−secondaryme−2decrease−quantity"data−product−id="{item.productId}">-</button>
<input type="number" class="form-control text-center quantity-input" value="item.quantity"min="1"style="width:70px;"data−product−id="{item.productId}">
<button class="btn btn-sm btn-outline-secondary ms-2 increase-quantity" data-product-id="item.productId">+</button><buttonclass="btnbtn−smbtn−dangerms−3remove−item"data−product−id="{item.productId}">X</button>
</div>
</div>
</div>
</div>
</div>
`;
container.innerHTML += itemHtml;
});

  addCartEventListeners();
  updateTotals();
  updateCartCountDisplay();
}

function addCartEventListeners() {
  document.querySelectorAll('.increase-quantity').forEach(button => {
    button.onclick = (e) => updateItemQuantity(e.target.dataset.productId, 1);
  });
  document.querySelectorAll('.decrease-quantity').forEach(button => {
    button.onclick = (e) => updateItemQuantity(e.target.dataset.productId, -1);
  });
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.onchange = (e) => updateItemQuantityAbsolute(e.target.dataset.productId, parseInt(e.target.value));
  });
  document.querySelectorAll('.remove-item').forEach(button => {
    button.onclick = (e) => removeItem(e.target.dataset.productId);
  });
}

async function updateItemQuantity(productId, change) {
  const item = currentCart.items.find(i => i.productId === productId);
  if (item) {
    const newQuantity = item.quantity + change;
    await updateCartOnServer(productId, newQuantity);
  }
}

async function updateItemQuantityAbsolute(productId, newQuantity) {
  await updateCartOnServer(productId, newQuantity);
}

async function removeItem(productId) {
  if (confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
    try {
      const userId = '60c72b2f9b1d8e001c8a1b2c'; // Usar el userId de prueba
      const response = await fetch('http://localhost:3000/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId }),
      });
      const updatedCart = await response.json();
      currentCart = updatedCart;
      displayCart();
    } catch (error) {
      console.error('Error al eliminar producto del carrito:', error);
      alert('Error al eliminar producto del carrito.');
    }
  }
}

async function updateCartOnServer(productId, quantity) {
  const userId = '60c72b2f9b1d8e001c8a1b2c'; // Usar el userId de prueba
  try {
    const response = await fetch('http://localhost:3000/cart/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId, quantity }),
    });
    const updatedCart = await response.json();
    currentCart = updatedCart;
    displayCart();
  } catch (error) {
    console.error('Error al actualizar el carrito:', error);
    alert('Error al actualizar la cantidad del producto.');
  }
}

function updateTotals() {
  let subtotal = 0;
  let totalItems = 0;
  if (currentCart.items) {
    currentCart.items.forEach(item => {
      subtotal += item.price * item.quantity;
      totalItems += item.quantity;
    });
  }
  document.getElementById('cart-subtotal').textContent = `$${subtotal.toLocaleString('es-CO')}`;
  document.getElementById('cart-total').textContent = `$${subtotal.toLocaleString('es-CO')}`; // Por ahora, envío gratis, así que subtotal = total
  document.getElementById('cart-item-count').textContent = totalItems;
}

// Inicializar Stripe Elements
async function initializeStripeElements() {
  if (currentCart.items.length === 0) {
    document.getElementById('payment-element').innerHTML = '<p class="text-center">Agrega productos para proceder al pago.</p>';
    return;
  }
  
  const userId = '60c72b2f9b1d8e001c8a1b2c'; // Usar el userId de prueba
  try {
    // Obtenemos el client secret del backend
    const response = await fetch('http://localhost:3000/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: currentCart.items, userId: userId }),
    });
    const { clientSecret } = await response.json();

    if (clientSecret) {
      const appearance = { theme: 'stripe' };
      elements = stripe.elements({ clientSecret, appearance });
      const paymentElement = elements.create('payment');
      paymentElement.mount('#payment-element');
    } else {
      document.getElementById('payment-message').textContent = 'No se pudo inicializar la pasarela de pagos.';
    }
  } catch (error) {
    console.error('Error al inicializar Stripe Elements:', error);
    document.getElementById('payment-message').textContent = 'Error al cargar la pasarela de pagos.';
  }
}
