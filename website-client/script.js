// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const html = document.documentElement;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

// Update icon based on theme
function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// Shopping cart functionality
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartDisplay();
    }

    // Load cart from localStorage
    loadCart() {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    // Add item to cart
    addItem(productId, productName, productPrice) {
        const existingItem = this.items.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: productId,
                name: productName,
                price: parseFloat(productPrice),
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartDisplay();
        this.showNotification(`${productName} ajouté au panier`);
    }

    // Get total items count
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Get total price
    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Remove item from cart
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
        this.renderCart();
    }

    // Update item quantity
    updateQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
                this.renderCart();
            }
        }
    }

    // Clear cart
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
        this.renderCart();
        this.showNotification('Panier vidé');
    }

    // Render cart content
    renderCart() {
        const cartContent = document.getElementById('cart-content');
        const cartSummary = document.getElementById('cart-summary');
        
        if (!cartContent) return;

        if (this.items.length === 0) {
            cartContent.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
            cartSummary.style.display = 'none';
            return;
        }

        // Build cart items HTML
        let html = '<div class="cart-items">';
        this.items.forEach(item => {
            html += `
                <div class="cart-item" data-product-id="${item.id}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p class="cart-item-price">${item.price.toFixed(2)} €</p>
                    </div>
                    <div class="cart-item-controls">
                        <button class="btn-quantity" data-action="decrease">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="btn-quantity" data-action="increase">+</button>
                        <button class="btn-remove" title="Retirer">🗑️</button>
                    </div>
                    <div class="cart-item-total">
                        ${(item.price * item.quantity).toFixed(2)} €
                    </div>
                </div>
            `;
        });
        html += '</div>';

        cartContent.innerHTML = html;
        cartSummary.style.display = 'block';

        // Update total
        const totalAmount = document.getElementById('cart-total-amount');
        if (totalAmount) {
            totalAmount.textContent = this.getTotalPrice().toFixed(2) + ' €';
        }

        // Add event listeners for cart controls
        this.attachCartEventListeners();
    }

    // Attach event listeners to cart item controls
    attachCartEventListeners() {
        // Quantity buttons
        document.querySelectorAll('.cart-item').forEach(itemEl => {
            const productId = itemEl.dataset.productId;
            
            // Decrease button
            const decreaseBtn = itemEl.querySelector('[data-action="decrease"]');
            decreaseBtn.addEventListener('click', () => {
                const item = this.items.find(i => i.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity - 1);
                }
            });

            // Increase button
            const increaseBtn = itemEl.querySelector('[data-action="increase"]');
            increaseBtn.addEventListener('click', () => {
                const item = this.items.find(i => i.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity + 1);
                }
            });

            // Remove button
            const removeBtn = itemEl.querySelector('.btn-remove');
            removeBtn.addEventListener('click', () => {
                this.removeItem(productId);
            });
        });
    }

    // Update cart counter in header
    updateCartDisplay() {
        const cartLink = document.querySelector('a[href="#panier"]');
        if (cartLink) {
            const count = this.getTotalItems();
            cartLink.textContent = `Panier (${count})`;
        }
        this.renderCart();
    }

    // Show notification when item is added
    showNotification(message) {
        // Remove existing notification if any
        const existingNotif = document.querySelector('.cart-notification');
        if (existingNotif) {
            existingNotif.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 10);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Add event listeners to all "Add to cart" buttons
document.addEventListener('DOMContentLoaded', () => {
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            const productName = e.target.dataset.productName;
            const productPrice = e.target.dataset.productPrice;
            
            cart.addItem(productId, productName, productPrice);
        });
    });

    // Clear cart button
    const clearCartBtn = document.getElementById('btn-clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('Voulez-vous vraiment vider le panier ?')) {
                cart.clearCart();
            }
        });
    }

    // Checkout button
    const checkoutBtn = document.getElementById('btn-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            alert('Fonctionnalité de paiement non implémentée pour cette démo');
        });
    }

    // Initial render of cart
    cart.renderCart();
});
