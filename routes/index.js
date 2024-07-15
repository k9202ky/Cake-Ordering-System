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

/* POST login user. */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.json({ success: false, message: '請輸入電子郵件和密碼' });
  }

  try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
          return res.json({ success: false, message: '用戶不存在' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.json({ success: false, message: '密碼錯誤' });
      }

      // Here you would typically create a session or JWT token
      // For simplicity, we're just sending a success message
      res.json({ success: true, message: '登入成功' });
  } catch (error) {
      console.error('Login error:', error);
      res.json({ success: false, message: '登入過程中發生錯誤，請稍後再試' });
  }
});

module.exports = router;
