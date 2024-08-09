document.addEventListener('DOMContentLoaded', () => {

    const token = localStorage.getItem('token');
    if (!token) {
        // 如果沒有登入，重定向到登入頁面
        window.location.href = '/login';
        return;
    }

    // 顯示使用者名稱和電話
    const username = localStorage.getItem('username');
    const phone = localStorage.getItem('phone');
    document.getElementById('username').textContent = username || 'N/A';
    document.getElementById('phone').textContent = phone || 'N/A';

    // 顯示購物車內容
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalContainer = document.getElementById('cartTotal');
    const confirmOrderButton = document.getElementById('confirmOrderButton');
    let total = 0;

    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'checkout-item';
        itemElement.innerHTML = `
            <span>${item.name} (${item.size}${item.filling}) x ${item.quantity}</span>
            <span>$${itemTotal}</span>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    cartTotalContainer.textContent = total;

    // 設置取貨日期
    const pickupDateInput = document.getElementById('pickupDate');
    const today = new Date();
    today.setDate(today.getDate() + 1); // 從明天開始
    pickupDateInput.min = today.toISOString().split('T')[0]; // 設定最小日期

    if (total === 0) {
        confirmOrderButton.style.display = 'none';
    } else {
        confirmOrderButton.style.display = 'block';
    }

    // 設置取貨時間
    const pickupTimeInput = document.getElementById('pickupTime');
    for (let hour = 8; hour <= 21; hour++) {
        pickupTimeInput.appendChild(createOption(`${hour}:00`));
        pickupTimeInput.appendChild(createOption(`${hour}:30`));
    }

    function createOption(time) {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        return option;
    }

    // 處理確認訂單
    confirmOrderButton.addEventListener('click', () => {
        const selectedDate = pickupDateInput.value;
        const selectedTime = pickupTimeInput.value;

        if (!selectedDate || !selectedTime) {
            alert('請選擇取貨日期和時間');
            return;
        }

        const orderDetails = {
            username,
            phone,
            cartItems,
            total,
            pickupDate: selectedDate,
            pickupTime: selectedTime
        };

        // 在這裡可以將 orderDetails 送到伺服器
        console.log('訂單確認:', orderDetails);
        alert('非常抱歉，目前網頁還在製作中，請直接撥打電話訂購！');
        localStorage.removeItem('cart'); // 清空購物車
        window.location.href = '/'; // 重定向到首頁
    });
});
