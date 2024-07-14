const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 添加登錄路由
router.post('/register', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    
    // 將 email 轉換為小寫
    const lowerCaseEmail = email.toLowerCase();

    // 檢查 email 是否已存在
    const existingUser = await User.findOne({ email: lowerCaseEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '該電子郵件已被註冊' });
    }

    // 創建新用戶
    const newUser = new User({
      username,
      email: lowerCaseEmail,
      phone,
      password: await bcrypt.hash(password, 10)
    });

    await newUser.save();
    res.status(201).json({ success: true, message: '用戶註冊成功' });
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({ success: false, message: '註冊過程中發生錯誤', error: error.message });
  }
});

module.exports = router;
