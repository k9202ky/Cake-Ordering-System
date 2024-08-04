class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.priceList = {
            'tiramisu': {
                'small': 500,
                'medium': 750,
                'large': 1000
            },
            'ice cream cake': {
                'small': 600,
                'medium': 850,
                'large': 1100,
                'xlarge': 1350  
            },
            'cream cake': {
                'small': 500,
                'medium': 750,
                'large': 1000,
                'xlarge': 1350
            },
            'chocolate cake': {
                'small': 500,
                'medium': 750,
                'large': 1000,
                'xlarge': 1350
            }

            // 可以繼續添加更多蛋糕種類和尺寸
        };
        this.initEventListeners();
    }

    getPrice(cakeId, size) {
        return this.priceList[cakeId][size];
    }

    addItem(id, name, size, quantity) {
        const price = this.getPrice(id, size);
        const existingItem = this.items.find(item => item.id === id && item.size === size);
        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
        } else {
            this.items.push({ id, name, size, quantity: parseInt(quantity), price });
        }
        this.saveCart();
        this.updateCartUI();
    }

    removeItem(id, size) {
        this.items = this.items.filter(item => !(item.id === id && item.size === size));
        this.saveCart();
        this.updateCartUI();
    }

    updateQuantity(id, size, quantity) {
        const item = this.items.find(item => item.id === id && item.size === size);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeItem(id, size);
            } else {
                this.saveCart();
                this.updateCartUI();
            }
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (cartCount) {
            cartCount.textContent = this.items.reduce((sum, item) => sum + item.quantity, 0);
        }
        
        if (cartItems) {
            cartItems.innerHTML = '';
            let total = 0;

            this.items.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                let sizeDescription;
                switch(item.size) {
                    case 'small':
                        sizeDescription = '6吋';
                        break;
                    case 'medium':
                        sizeDescription = '8吋';
                        break;
                    case 'large':
                        sizeDescription = '10吋';
                        break;
                    case 'xlarge':
                        sizeDescription = '12吋';
                        break;
                    default:
                        sizeDescription = item.size;
                }

                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <span>${item.name} (${sizeDescription})</span>
                    <input type="number" value="${item.quantity}" min="1" 
                        data-id="${item.id}" data-size="${item.size}" class="quantity-input">
                    <span>$${itemTotal.toFixed(2)}</span>
                    <button class="remove-item" data-id="${item.id}" data-size="${item.size}">刪除</button>
                `;
                cartItems.appendChild(itemElement);
            });

            cartTotal.textContent = total.toFixed(2);
        }
    }

    initEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const { id, size } = e.target.dataset;
                this.removeItem(id, size);
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const { id, size } = e.target.dataset;
                this.updateQuantity(id, size, e.target.value);
            }
        });

        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('cartModal').style.display = 'none';
            });
        }

        window.addEventListener('click', (event) => {
            const cartModal = document.getElementById('cartModal');
            if (event.target === cartModal) {
                cartModal.style.display = 'none';
            }
        });
    }

    toggleCartView() {
        const cartModal = document.getElementById('cartModal');
        if (cartModal.style.display === 'none' || cartModal.style.display === '') {
            cartModal.style.display = 'block';
            this.updateCartUI();
        } else {
            cartModal.style.display = 'none';
        }
    }
}

window.cart = new Cart();

document.addEventListener('DOMContentLoaded', () => {
    cart.updateCartUI();
    
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            cart.toggleCartView();
        });
    }
});
