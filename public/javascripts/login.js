document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('登入成功！');
                window.location.href = '/'; // 登入成功後重定向到首頁
            } else {
                alert('登入失敗：' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('登入過程中發生錯誤，請稍後再試。');
        });
    });
});