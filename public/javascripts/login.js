document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        login(email, password)
            .then(() => {
                alert('登入成功！');
                window.location.href = '/'; // 登入成功後重定向到首頁
            })
            .catch(error => {
                alert('登入失敗：' + error.message);
            });
    });
});