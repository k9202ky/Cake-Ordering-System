const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const { sendEmail } = require('../services/emailService');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
require('dotenv').config();

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

/* GET contact page. */
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: '聯絡我們 - 祥盛中西禮餅',
    GOOGLE_MAP_API_KEY: process.env.GOOGLE_MAP_API_KEY
  });
});

/* GET cakes page. */
router.get('/cakes', (req, res) => {
  res.render('cakes', { title: '蛋糕 - 祥盛中西禮餅' });
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
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
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
  // 對於 JWT，客戶端應該自行清除 token
  res.json({ success: true, message: '成功登出' });
});

// 中間件：驗證 JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// 獲取當前用戶資訊的路由
router.get('/current-user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (user) {
      res.json({ loggedIn: true, user: user });
    } else {
      res.status(404).json({ loggedIn: false, message: '用戶不存在' });
    }
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ loggedIn: false, message: '獲取用戶信息時發生錯誤' });
  }
});


/* POST /forgot-password */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('找不到用戶:', email);
      return res.status(404).json({ message: '找不到該電子郵件地址的用戶' });
    }

    // 生成重設令牌
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 小時後過期

    await user.save();

    console.log('用戶保存後:', {
      id: user._id,
      email: user.email,
      resetPasswordToken: user.resetPasswordToken,
      resetPasswordExpires: user.resetPasswordExpires
    });

    // 再次檢查用戶是否正確保存
    const checkUser = await User.findOne({ email: user.email });
    console.log('再次檢查用戶:', {
      id: checkUser._id,
      email: checkUser.email,
      resetPasswordToken: checkUser.resetPasswordToken,
      resetPasswordExpires: checkUser.resetPasswordExpires
    });

    // 發送重設密碼郵件
    const resetUrl = `https://creamlady.com/reset-password/${resetToken}`;
    await sendEmail(
      user.email,
      '祥盛中西禮餅 - 重設您的密碼',
      `請點擊以下連結重設您的密碼：${resetUrl}`,
      `<p>請點擊<a href="${resetUrl}">這裡</a>重設您的密碼</p>`
    );

    res.json({ message: '已發送重設密碼的郵件，請查看您的郵箱' });
  } catch (error) {
    console.error('忘記密碼錯誤:', error);
    res.status(500).json({ message: '發送重設密碼郵件時發生錯誤' });
  }
});

/* GET /reset-password/:token */
router.get('/reset-password/:token', async (req, res) => {
  try {
    console.log('收到的令牌:', req.params.token);

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    console.log('找到的用戶:', user ? {
      id: user._id,
      email: user.email,
      resetPasswordToken: user.resetPasswordToken,
      resetPasswordExpires: user.resetPasswordExpires
    } : null);

    if (!user) {
      console.log('令牌無效或已過期');
      return res.status(400).render('error', { message: '密碼重設令牌無效或已過期' });
    }

    res.render('reset-password', { token: req.params.token });
  } catch (error) {
    console.error('重設密碼錯誤:', error);
    res.status(500).render('error', { message: '重設密碼時發生錯誤' });
  }
});

/* POST reset-password/:token */
router.post('/reset-password/:token', async (req, res) => {
  console.log('接收到重設密碼請求，令牌:', req.params.token);
  
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    console.log('找到的用戶:', user ? {
      id: user._id,
      email: user.email,
      resetPasswordTokenExists: !!user.resetPasswordToken,
      resetPasswordExpires: user.resetPasswordExpires
    } : null);

    if (!user) {
      console.log('密碼重設令牌無效或已過期');
      return res.status(400).json({ message: '密碼重設令牌無效或已過期' });
    }

    // 驗證新密碼
    if (!req.body.password) {
      console.log('新密碼未提供');
      return res.status(400).json({ message: '請提供新密碼' });
    }

    // 設置新密碼
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log('密碼已成功重設，用戶ID:', user._id);

    res.json({ message: '密碼已成功重設' });
  } catch (error) {
    console.error('重設密碼錯誤:', error);
    res.status(500).json({ message: '重設密碼時發生錯誤', error: error.message });
  }
});

/* GET /check-token/:token */
router.get('/check-token/:token', async (req, res) => {
  try {
    console.log('檢查令牌:', req.params.token);

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    console.log('令牌檢查時找到的用戶:', user ? {
      id: user._id,
      email: user.email,
      resetPasswordToken: user.resetPasswordToken,
      resetPasswordExpires: user.resetPasswordExpires
    } : null);

    res.json({ valid: !!user });
  } catch (error) {
    console.error('令牌檢查錯誤:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;