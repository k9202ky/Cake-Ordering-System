// 登入函數
function login(email, password) {
    return fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            return data;
        } else {
            throw new Error(data.message);
        }
    });
}

// 登出函數
function logout() {
    return fetch('/logout', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                showNotification(data.message);
                setTimeout(() => {
                    window.location.href = '/'; // 重定向到首頁
                }, 2000); // 2秒後重定向
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            showNotification('登出過程中發生錯誤：' + error.message, 'error');
        });
}

// 檢查登入狀態
function checkLoginStatus() {
    return fetch('/current-user', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            updateNavbar(localStorage.getItem('username'));
        } else {
            updateNavbarLoggedOut();
        }
        return data.loggedIn;
    });
}

// 顯示通知的函數
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    document.body.appendChild(notification);

    // 設置樣式
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '10px 20px',
        backgroundColor: type === 'success' ? '#4CAF50' : '#f44336',
        color: 'white',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: '1000'
    });

    // 3秒後自動移除通知
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 更新導航欄（登入狀態）
function updateNavbar(username) {
    const navUl = document.querySelector('nav ul');
    navUl.innerHTML = `
        <li><a href="/">首頁</a></li>
        <li><a href="/cakes">蛋糕目錄</a></li>
        <li><a href="/contact">聯絡我們</a></li>
        <li>您好：${username}</li>
        <li><a href="#" id="logoutBtn">登出</a></li>
    `;

    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
}

// 更新導航欄（未登入狀態）
function updateNavbarLoggedOut() {
    const navUl = document.querySelector('nav ul');
    navUl.innerHTML = `
        <li><a href="/">首頁</a></li>
        <li><a href="/cakes">蛋糕目錄</a></li>
        <li><a href="/contact">聯絡我們</a></li>
        <li><a href="/login">登入</a></li>
        <li><a href="/register">註冊</a></li>
    `;
}

// 頁面加載時檢查登入狀態
document.addEventListener('DOMContentLoaded', checkLoginStatus);