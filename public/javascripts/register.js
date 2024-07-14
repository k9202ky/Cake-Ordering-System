document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      if (password !== confirmPassword) {
        alert('密碼不匹配');
        return;
      }
      
      // 發送註冊請求到服務器
      fetch('/users/register', {  // 注意這裡的URL變化
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, phone, password }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('註冊成功！');
          window.location.href = '/login'; // 註冊成功後重定向到登入頁面
        } else {
          alert('註冊失敗：' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('註冊過程中發生錯誤，請稍後再試。');
      });
    });
  });