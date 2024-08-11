class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.priceList = {
            'tiramisu': {
                'small': 450,
                'medium': 675,
                'large': 900
            },
            'ice cream cake': {
                'small': 540,
                'medium': 765,
                'large': 990,
                'xlarge': 1215
            },
            'cream cake': {
                'small': 450,
                'medium': 675,
                'large': 900,
                'xlarge': 1215
            },
            'chocolate cake': {
                'small': 450,
                'medium': 675,
                'large': 900,
                'xlarge': 1215
            }
            // 可以繼續添加更多蛋糕種類和尺寸
        };
        this.fillingDescriptions = {
            'fruit_pudding': '水果+布丁',
            'taro_pudding': '芋頭+布丁',
            'blueberry_pudding': '藍莓+布丁'
        };
        this.initEventListeners();
    }

    getPrice(cakeId, size) {
        return this.priceList[cakeId][size];
    }

    getFillingDescription(filling) {
        return this.fillingDescriptions[filling] || filling;
    }

    addItem(id, name, size, filling, quantity) {
        const price = this.getPrice(id, size);
        const existingItem = this.items.find(item => item.id === id && item.size === size && item.filling === filling);
        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
        } else {
            this.items.push({ id, name, size, filling, quantity: parseInt(quantity), price });
        }
        this.saveCart();
        this.updateCartUI();
    }

    removeItem(id, size, filling) {
        this.items = this.items.filter(item => !(item.id === id && item.size === size && item.filling === filling));
        this.saveCart();
        this.updateCartUI();
    }

    updateQuantity(id, size, filling, quantity) {
        const item = this.items.find(item => item.id === id && item.size === size && item.filling === filling);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeItem(id, size, filling);
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
        const checkoutButton = document.getElementById('checkoutButton');

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
                switch (item.size) {
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
                    <span>${item.name} (${sizeDescription}${this.getFillingDescription(item.filling)})</span>
                    <input type="number" value="${item.quantity}" min="1" 
                        data-id="${item.id}" data-size="${item.size}" data-filling="${item.filling}" class="quantity-input">
                    <span>$${itemTotal}</span>
                    <button class="remove-item" data-id="${item.id}" data-size="${item.size}" data-filling="${item.filling}">刪除</button>
                `;
                cartItems.appendChild(itemElement);
            });

            cartTotal.textContent = total;
            if (checkoutButton) {
                checkoutButton.style.display = total > 0 ? 'block' : 'none';
            }
        }
    }

    initEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const { id, size, filling } = e.target.dataset;
                this.removeItem(id, size, filling);
            }

            if (e.target.id === 'checkoutButton') {
                this.handleCheckout();
            }

            //點其他區域購物車關閉
            const cartModal = document.getElementById('cartModal');
            if (cartModal && cartModal.style.display === 'block' && !e.target.closest('#cartModal, #cartIcon')) {
                this.toggleCartView();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const { id, size, filling } = e.target.dataset;
                this.updateQuantity(id, size, filling, e.target.value);
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

    handleCheckout() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('請先登入才能進行結帳');
            window.location.href = '/login'; // 重定向到登入頁面
        } else {
            window.location.href = '/checkout'; // 重定向到結帳頁面
        }
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
