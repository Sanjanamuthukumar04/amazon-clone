import { cart, removeFromCart, updateDeliveryOption } from "../data/cart.js";
import { products } from "../data/products.js";
import { getDeliveryOption } from "../data/deliveryOptions.js";

function renderOrderSummary() {
  const emptyCartMessageElem = document.querySelector('.js-empty-cart-message');
  const paymentSummaryElem = document.querySelector('.js-payment-summary');
  const pageTitleElem = document.querySelector('.page-title');

  if (cart.length === 0) {
    document.querySelector('.js-order-summary').innerHTML = '';
    emptyCartMessageElem.style.display = 'block';
    paymentSummaryElem.style.display = 'none';
    pageTitleElem.style.display = 'none';
    return;
  } else {
    emptyCartMessageElem.style.display = 'none';
    paymentSummaryElem.style.display = 'block';
    pageTitleElem.style.display = 'block';
  }

  let cartSummaryHTML = '';

  cart.forEach((cartItem) => {
    const productId = cartItem.productId;
    const matchingProduct = products.find(p => p.id === productId);
    const currentDeliveryOptionId = cartItem.deliveryOptionId || '1';
    const currentDeliveryOption = getDeliveryOption(currentDeliveryOptionId);

    const quantityOptionsHTML = Array.from({ length: 10 }, (_, i) => {
      const qty = i + 1;
      return `<option value="${qty}" ${cartItem.quantity === qty ? 'selected' : ''}>${qty}</option>`;
    }).join('');

    cartSummaryHTML += `
      <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
        <div class="delivery-date js-delivery-date-${matchingProduct.id}">
          Delivery in ${currentDeliveryOption.deliveryDays} days
        </div>

        <div class="cart-item-details-grid">
          <img class="product-image" src="${matchingProduct.image}">

          <div class="cart-item-details">
            <div class="product-name">${matchingProduct.name}</div>
            <div class="product-price">₹${matchingProduct.price}</div>
            <div class="product-quantity">
              Quantity:
              <select class="js-quantity-select" data-product-id="${matchingProduct.id}">
                ${quantityOptionsHTML}
              </select>
              <button class="update-button js-update-button" data-product-id="${matchingProduct.id}">Update</button>
              <button class="delete-button js-delete-button" data-product-id="${matchingProduct.id}">Delete</button>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">Choose a delivery option:</div>

            ${['1', '2', '3'].map(optionId => {
              const option = getDeliveryOption(optionId);
              return `
              <div class="delivery-option">
                <input 
                  type="radio" 
                  class="delivery-option-input js-delivery-option"
                  data-product-id="${matchingProduct.id}"
                  data-delivery-option-id="${option.id}"
                  name="delivery-option-${matchingProduct.id}"
                  ${currentDeliveryOptionId === option.id ? 'checked' : ''}
                >
                <div>
                  <div class="delivery-option-date">${option.deliveryDays} days</div>
                  <div class="delivery-option-price">${option.price === 0 ? 'FREE Shipping' : `₹${option.price} Shipping`}</div>
                </div>
              </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  });

  document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;

  document.querySelectorAll('.js-delete-button').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      removeFromCart(productId);

      const container = document.querySelector(`.js-cart-item-container-${productId}`);
      container.remove();

      saveCartToStorage();
      updateCartQuantityOnHeader();

      if (cart.length === 0) {
        renderOrderSummary();
      } else {
        calculateSummary();
      }
    });
  });

  document.querySelectorAll('.js-delivery-option').forEach((radio) => {
    radio.addEventListener('change', () => {
      const productId = radio.dataset.productId;
      const deliveryOptionId = radio.dataset.deliveryOptionId;

      const deliveryDateElem = document.querySelector(`.js-delivery-date-${productId}`);
      const option = getDeliveryOption(deliveryOptionId);
      deliveryDateElem.innerHTML = `Delivery in ${option.deliveryDays} days`;

      updateDeliveryOption(productId, deliveryOptionId);

      saveCartToStorage();
      calculateSummary();
    });
  });

  document.querySelectorAll('.js-update-button').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      const cartItem = cart.find(item => item.productId === productId);

      const selectElem = document.querySelector(`.js-quantity-select[data-product-id="${productId}"]`);
      const newQty = parseInt(selectElem.value);

      if (!isNaN(newQty) && newQty >= 1 && newQty <= 10) {
        cartItem.quantity = newQty;

        saveCartToStorage();
        updateCartQuantityOnHeader();
        renderOrderSummary();
      }
    });
  });

  calculateSummary();
}

function calculateSummary() {
  let itemsPrice = 0;
  let shippingPrice = 0;

  cart.forEach(cartItem => {
    const product = products.find(p => p.id === cartItem.productId);
    itemsPrice += product.price * cartItem.quantity;

    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId || '1');
    shippingPrice += deliveryOption.price;
  });

  const subtotal = itemsPrice + shippingPrice;
  const tax = Math.round(subtotal * 0.10);
  const total = subtotal + tax;

  document.querySelector('.js-items-price').innerHTML = `₹${itemsPrice}`;
  document.querySelector('.js-shipping-price').innerHTML = `₹${shippingPrice}`;
  document.querySelector('.js-subtotal').innerHTML = `₹${subtotal}`;
  document.querySelector('.js-tax').innerHTML = `₹${tax}`;
  document.querySelector('.js-order-total').innerHTML = `₹${total}`;
}

function saveCartToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartQuantityOnHeader() {
  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const elem = document.querySelector('.js-cart-quantity');
  if (elem) elem.innerHTML = cartQuantity;
}

document.querySelector('.js-place-order-button')?.addEventListener('click', () => {
  cart.length = 0;
  saveCartToStorage();
  updateCartQuantityOnHeader();
  renderOrderSummary();

  const emptyCartMsg = document.querySelector('.js-empty-cart-message');
  if (emptyCartMsg) {
    emptyCartMsg.innerHTML = `Your order has been placed! <a href="index.html">Continue shopping.</a>`;
  }
});

renderOrderSummary();
