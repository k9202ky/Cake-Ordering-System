const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const { sendEmail } = require('../services/emailService');
const { Client } = require('@line/bot-sdk');
require('dotenv').config();

// 設置 SendGrid API 密鑰
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// LINE Bot 設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};
const client = new Client(config);

// 頁面路由
router.get('/', (req, res) => {
  res.render('index', { title: '祥盛中西禮餅' });
});

router.get('/login', (req, res) => {
  res.render('login', { title: '登入 - 祥盛中西禮餅' });
});

router.get('/register', (req, res) => {
  res.render('register', { title: '註冊 - 祥盛中西禮餅' });
});

router.get('/contact', (req, res) => {
  res.render('contact', { title: '聯絡我們 - 祥盛中西禮餅' });
});

router.get('/cakes', (req, res) => {
  res.render('cakes', { title: '蛋糕 - 祥盛中西禮餅' });
});

router.get('/checkout', (req, res) => {
  res.render('checkout', { title: '確認購買 - 祥盛中西禮餅' });
});

router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { title: '忘記密碼 - 祥盛中西禮餅' });
});

router.get('/reset-password', (req, res) => {
  res.render('reset-password', { title: '重設密碼 - 祥盛中西禮餅' });
});

// 用戶認證相關路由
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: '電子郵件或密碼錯誤' });
    }
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

router.post('/logout', (req, res) => {
  res.json({ success: true, message: '成功登出' });
});

// JWT 驗證中間件
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

// 忘記密碼和重設密碼相關路由
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('找不到用戶:', email);
      return res.status(404).json({ message: '找不到該電子郵件地址的用戶' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 小時後過期

    await user.save();

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

router.get('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

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

router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log('密碼重設令牌無效或已過期');
      return res.status(400).json({ message: '密碼重設令牌無效或已過期' });
    }

    if (!req.body.password) {
      console.log('新密碼未提供');
      return res.status(400).json({ message: '請提供新密碼' });
    }

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

router.get('/check-token/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    res.json({ valid: !!user });
  } catch (error) {
    console.error('令牌檢查錯誤:', error);
    res.status(500).json({ error: error.message });
  }
});

// LINE 通知相關函數和路由
function getDisplaySize(size) {
  const sizeMap = {
    small: '6吋',
    medium: '8吋',
    large: '10吋',
    xlarge: '12吋'
  };
  return sizeMap[size] || size;
}

function getDisplayFilling(filling) {
  const fillingMap = {
    fruit_pudding: '水果+布丁',
    taro_pudding: '芋頭+布丁',
    blueberry_pudding: '藍莓+布丁'
  };
  return fillingMap[filling] || filling;
}

router.post('/send-line-notification', (req, res) => {
  const orderDetails = req.body;
  let cakeDetails = orderDetails.cartItems.map(item => 
    `${item.name} (${getDisplaySize(item.size)} ${getDisplayFilling(item.filling)}) x ${item.quantity}`
  ).join('\n');

  const message = {
    type: 'text',
    text: `新訂單通知:
          訂購人: ${orderDetails.username}
          電話: ${orderDetails.phone}
          訂購內容:
          ${cakeDetails}
          總金額: $${orderDetails.total}
          取貨時間: ${orderDetails.pickupDate} ${orderDetails.pickupTime}`
  };

  const userIds = [process.env.LINE_USER_ID, process.env.LINE_USER_ID_2];

  Promise.all(userIds.map(userId => client.pushMessage(userId, message)))
    .then(() => {
      res.json({ success: true, message: 'LINE通知已發送給所有使用者' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ success: false, message: '發送LINE通知時出錯' });
    });
});

module.exports = router;