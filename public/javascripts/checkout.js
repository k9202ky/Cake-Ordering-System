document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const username = localStorage.getItem('username');
    const phone = localStorage.getItem('phone');
    document.getElementById('username').textContent = username || 'N/A';
    document.getElementById('phone').textContent = phone || 'N/A';

    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalContainer = document.getElementById('cartTotal');
    const confirmOrderButton = document.getElementById('confirmOrderButton');
    const pickupDateInput = document.getElementById('pickupDate');
    const pickupTimeInput = document.getElementById('pickupTime');

    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    function updateCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        cartItems.forEach((item, index) => {
            const itemTotal = Math.round(item.price * item.quantity);
            total += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.className = 'checkout-item';
            itemElement.innerHTML = `
                <span>${item.name} (${item.size}, ${item.filling}) x 
                    <input type="number" min="1" value="${item.quantity}" class="item-quantity" data-index="${index}">
                </span>
                <span class="item-total">$${itemTotal}</span>
                <button class="remove-item" data-index="${index}">刪除</button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
       
        localStorage.setItem('cart', JSON.stringify(cartItems));  // 確保更新後的 cartItems 被保存

        if (total === 0) {
            confirmOrderButton.style.display = 'none';
        } else {
            confirmOrderButton.style.display = 'block';
        }
    }

    updateCart();

    // 設置取貨日期
    const today = new Date();
    today.setDate(today.getDate() + 1);
    pickupDateInput.min = today.toISOString().split('T')[0];

    // 設置取貨時間
    for (let hour = 9; hour <= 21; hour++) {
        pickupTimeInput.appendChild(createOption(`${hour}:00`));
        pickupTimeInput.appendChild(createOption(`${hour}:30`));
    }

    function createOption(time) {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        return option;
    }

    // 監聽數量變更
    cartItemsContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('item-quantity')) {
            const index = parseInt(e.target.dataset.index);
            const newQuantity = parseInt(e.target.value);
            if (newQuantity > 0) {
                cartItems[index].quantity = newQuantity;
                const itemTotal = Math.round(cartItems[index].price * newQuantity);
                e.target.closest('.checkout-item').querySelector('.item-total').textContent = `$${itemTotal}`;
                updateCart(); // 確保更新的數量和價格被儲存
            } else {
                e.target.value = cartItems[index].quantity; // 重置為原來的數量
            }
        }
    });

    // 監聽刪除按鈕
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const index = parseInt(e.target.dataset.index);
            cartItems.splice(index, 1);
            updateCart();
        }
    });

    // 處理確認訂單
    confirmOrderButton.addEventListener('click', () => {
        const selectedDate = pickupDateInput.value;
        const selectedTime = pickupTimeInput.value;

        if (!selectedDate || !selectedTime) {
            alert('請選擇取貨日期和時間');
            return;
        }

        cartItems = JSON.parse(localStorage.getItem('cart')) || []; // 確保是最新的數據
        const orderDetails = {
            username,
            phone,
            cartItems,
            total: Math.round(parseFloat(cartTotalContainer.textContent)),
            pickupDate: selectedDate,
            pickupTime: selectedTime
        };

        console.log('訂單確認:', orderDetails);
        sendLineNotification(orderDetails);
        alert('訂購成功!請在取貨時間到店領取並付款，感謝您的訂購！');
        localStorage.removeItem('cart');
        window.location.href = '/';
    });
});

function sendLineNotification(orderDetails) {
    fetch('/send-line-notification', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails)
    })
    .then(response => response.json())
    .then(data => {
        console.log('LINE通知發送成功:', data);
    })
    .catch(error => {
        console.error('發送LINE通知時出錯:', error);
    });
}
