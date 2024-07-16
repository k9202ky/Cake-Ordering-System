const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config(); // 確保 dotenv 被正確加載

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// 設置視圖引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// session 中間件設置
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 } // 24 小時
}));

// 其他中間件設置
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 路由設置
app.use('/', indexRouter);
app.use('/users', usersRouter);

// 處理404錯誤
app.use(function(req, res, next) {
  next(createError(404));
});

// 錯誤處理
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// 連接數據庫並啟動服務器
const connectDBAndStartServer = async () => {
  try {
    await mongoose.connect('mongodb+srv://k9202ky:k200891359d@cluster0.2pgtsea.mongodb.net/?tls=true', {});
    console.log('MongoDB connected successfully');
    await mongoose.connection.db.admin().ping();
    console.log('Database connection is responsive');

    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB or start server:', error);
    process.exit(1);
  }
};

connectDBAndStartServer();
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY);

module.exports = app;
