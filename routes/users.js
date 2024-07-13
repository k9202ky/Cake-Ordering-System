const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 添加登錄路由
router.post('/login', async (req, res) => {
  try {
      const { email, password } = req.body;
      
      // 查找用戶
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: '用戶不存在' });
      }

      // 驗證密碼
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: '密碼錯誤' });
      }

      // 登入成功
      res.status(200).json({ message: '登入成功', user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;
