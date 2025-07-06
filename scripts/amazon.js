import { products } from '../data/products.js';
import { cart, addToCart } from "../data/cart.js";

const SIZE_CHART_PRODUCTS = [
  "83d4ca15-0f35-48f5-b7a3-1ea210004f2e",
  "5968897c-4d27-4872-89f6-5bcb052746d7",
  "1111aaaa-bbbb-cccc-dddd-eeeeffff0001",
  "1111aaaa-bbbb-cccc-dddd-eeeeffff0004"
];

function renderProducts(filteredProducts) {
  let productsHTML = '';

  filteredProducts.forEach((product) => {
    const isClothing = [
      '83d4ca15-0f35-48f5-b7a3-1ea210004f2e',
      '5968897c-4d27-4872-89f6-5bcb052746d7',
      '1111aaaa-bbbb-cccc-dddd-eeeeffff0001',
      '1111aaaa-bbbb-cccc-dddd-eeeeffff0004'
    ].includes(product.id);

    const isShoe = [
      '58b4fc92-e98c-42aa-8c55-b6b79996769a',
      '04701903-bc79-49c6-bc11-1af7e3651358',
      '1111aaaa-bbbb-cccc-dddd-eeeeffff0008'
    ].includes(product.id);

    productsHTML += `
      <div class="product-container">
        <div class="product-image-container">
          <img class="product-image" src="${product.image}">
        </div>

        <div class="product-name limit-text-to-2-lines">
          ${product.name}
        </div>

        <div class="product-rating-container">
          <img class="product-rating-stars"
            src="images/ratings/rating-${Math.round(product.rating.stars * 2) * 5}.png">
          <div class="product-rating-count link-primary">
            ${product.rating.count}
          </div>
        </div>

        <div class="product-price">
          ₹${product.price}
        </div>

        <div class="product-quantity-container">
          <select class="js-quantity-selector" data-product-id="${product.id}">
            ${[...Array(10).keys()].map(i => `
              <option value="${i + 1}" ${i === 0 ? 'selected' : ''}>${i + 1}</option>
            `).join('')}
          </select>
        </div>

        <div class="product-spacer"></div>

        ${isClothing ? `
          <button class="button-size-chart js-size-chart" data-type="clothing">
            Size Chart
          </button>` : ''
        }

        ${isShoe ? `
          <button class="button-size-chart js-size-chart" data-type="shoe">
            Shoe Size Chart
          </button>` : ''
        }

        <div class="added-to-cart">
          <img src="images/icons/checkmark.png">
          Added
        </div>

        <button class="add-to-cart-button button-primary js-add-to-cart"
          data-product-id="${product.id}">
          Add to Cart
        </button>
      </div>
    `;
  });

  document.querySelector('.js-products-grid').innerHTML = productsHTML;

  document.querySelectorAll('.js-add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      const selectElem = document.querySelector(`.js-quantity-selector[data-product-id="${productId}"]`);
      const quantity = parseInt(selectElem.value);
      addToCart(productId, quantity);
      updateCartQuantity();
    });
  });

  document.querySelectorAll('.js-size-chart').forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.type;
      if (type === 'clothing') {
        window.open('images/sizeChart.webp', '_blank');
      } else if (type === 'shoe') {
        window.open('images/shoeChart.jpg', '_blank');
      }
    });
  });
}


function updateCartQuantity() {
  let cartQuantity = 0;

  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });

  document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
}

document.getElementById('close-size-chart').addEventListener('click', () => {
  document.getElementById('size-chart-modal').style.display = 'none';
});

renderProducts(products);
updateCartQuantity();

const searchInput = document.querySelector('.js-search-input');
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = products.filter(product => 
    product.name.toLowerCase().includes(query) ||
    product.keywords.some(kw => kw.toLowerCase().includes(query))
  );

  renderProducts(filtered);
});
