const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '祥盛中西禮餅' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: '登入 - 祥盛中西禮餅' });
});

/* GET register page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: '註冊 - 祥盛中西禮餅' });
});

/* POST register user. */
router.post('/register', async (req, res) => {
  const { username, email, phone, password } = req.body;

  // 驗證必填字段
  if (!username || !email || !phone || !password) {
      return res.json({ success: false, message: '所有字段都是必填的' });
  }

  try {
      // 檢查是否已有相同的email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.json({ success: false, message: '該電子郵件已被註冊' });
      }

      // 加密密碼
      const hashedPassword = await bcrypt.hash(password, 10);

      // 創建新用戶
      const newUser = new User({
          username,
          email,
          phone,
          password: hashedPassword
      });

      // 保存新用戶到數據庫
      await newUser.save();

      res.json({ success: true, message: '註冊成功' });
  } catch (error) {
      console.error('Error:', error);
      res.json({ success: false, message: '註冊過程中發生錯誤，請稍後再試' });
  }
});

module.exports = router;
