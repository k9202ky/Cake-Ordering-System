const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

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

  try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ success: false, message: '電子郵件或密碼錯誤' });
      }

      // 創建 JWT
      const token = jwt.sign(
          { userId: user._id, username: user.username },
          'your_jwt_secret',
          { expiresIn: '24h' }
      );

      // 設置 session
      req.session.userId = user._id;

      res.json({ 
          success: true, 
          message: '登入成功', 
          username: user.username,
          token: token
      });
  } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: '登入過程中發生錯誤，請稍後再試' });
  }
});

// 登出路由
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          return res.status(500).json({ success: false, message: '登出失敗' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: '成功登出' });
  });
});

// 獲取當前用戶資訊的路由
router.get('/current-user', (req, res) => {
  if (req.session.userId) {
      // 這裡可以從數據庫獲取更多用戶資訊
      res.json({ loggedIn: true, userId: req.session.userId });
  } else {
      res.json({ loggedIn: false });
  }
});

module.exports = router;
