const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const { sendEmail } = require('../services/emailService');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: '祥盛中西禮餅' });
});

/* GET login page. */
router.get('/login', (req, res) => {
  res.render('login', { title: '登入 - 祥盛中西禮餅' });
});

/* GET register page. */
router.get('/register', (req, res) => {
  res.render('register', { title: '註冊 - 祥盛中西禮餅' });
});

/* GET forgot-password page. */
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { title: '忘記密碼 - 祥盛中西禮餅' });
});

/* GET reset-password page. */
router.get('/reset-password', (req, res) => {
  res.render('reset-password', { title: '重設密碼 - 祥盛中西禮餅' });
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
      token: token,
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


/* POST forgot-password. */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: '找不到該電子郵件地址的用戶' });
    }

    // 生成重設令牌
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 小時後過期
    await user.save();

    // 發送重設密碼郵件
    const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}`;
    await sendEmail(
      user.email,
      '重設您的密碼',
      `請點擊以下連結重設您的密碼：${resetUrl}`,
      `<p>請點擊<a href="${resetUrl}">這裡</a>重設您的密碼</p>`
    );

    res.json({ message: '已發送重設密碼的郵件，請查看您的郵箱' });
  } catch (error) {
    console.error('忘記密碼錯誤:', error);
    res.status(500).json({ message: '發送重設密碼郵件時發生錯誤' });
  }
});

/* GET reset-password/:token. */
router.get('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send('密碼重設令牌無效或已過期');
    }

    res.render('reset-password', { token: req.params.token });
  } catch (error) {
    console.error('重設密碼錯誤:', error);
    res.status(500).send('重設密碼時發生錯誤');
  }
});

/* POST reset-password/:token. */
router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: '密碼重設令牌無效或已過期' });
    }

    // 設置新密碼
    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: '密碼已成功重設' });
  } catch (error) {
    console.error('重設密碼錯誤:', error);
    res.status(500).json({ message: '重設密碼時發生錯誤' });
  }
});

module.exports = router;