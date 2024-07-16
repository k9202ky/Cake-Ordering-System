document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        return alert('密碼不匹配');
    }

    const token = window.location.pathname.split('/').pop();

    try {
        const response = await fetch(`/reset-password/${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        const data = await response.json();
        alert(data.message);
        window.location.href = '/login'; // 重定向到登入頁面
    } catch (error) {
        console.error('Error:', error);
        alert('重設密碼時發生錯誤');
    }
});