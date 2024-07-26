// 登入函數
function login(email, password) {
    console.log('嘗試登入:', email);
    return fetch('https://www.creamlady.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('登入失敗');
        }
        return response.json();
    })
    .then(data => {
        console.log('登入回應:', data);
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            console.log('登入成功，已儲存 token 和 username');
            return data;
        } else {
            throw new Error(data.message || '登入失敗');
        }
    })
    .catch(error => {
        console.error('登入錯誤:', error);
        throw error;
    });
}

// 登出函數
function logout() {
    console.log('嘗試登出');
    const token = localStorage.getItem('token');
    return fetch('https://www.creamlady.com/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('登出回應:', data);
        if (data.success) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            console.log('已清除本地存儲');
            showNotification(data.message);
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            throw new Error(data.message || '登出失敗');
        }
    })
    .catch(error => {
        console.error('登出錯誤:', error);
        showNotification('登出過程中發生錯誤：' + error.message, 'error');
    });
}

// 檢查登入狀態
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    console.log('檢查登入狀態，token:', token ? '存在' : '不存在');
    if (!token) {
        console.log('無 token，視為未登入');
        updateNavbarLoggedOut();
        return Promise.resolve(false);
    }

    // 這裡使用完整的 URL
    return fetch('https://www.creamlady.com/current-user', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('伺服器回應不正確');
        }
        return response.json();
    })
    .then(data => {
        console.log('檢查登入狀態回應:', data);
        if (data.loggedIn) {
            updateNavbar(data.user.username);
        } else {
            updateNavbarLoggedOut();
        }
        return data.loggedIn;
    })
    .catch(error => {
        console.error('檢查登入狀態錯誤:', error);
        updateNavbarLoggedOut();
        return false;
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
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 已加載，開始檢查登入狀態');
    checkLoginStatus().then(loggedIn => {
        console.log('登入狀態檢查完成，用戶是否登入:', loggedIn);
    });
});
