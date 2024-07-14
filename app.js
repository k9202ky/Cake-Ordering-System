var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// 設置視圖引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 中間件設置
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
  // 設置本地變量，只在開發環境中提供錯誤信息
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 渲染錯誤頁面
  res.status(err.status || 500);
  res.render('error');
});

// 連接數據庫並啟動服務器
const connectDBAndStartServer = async () => {
  try {
    await mongoose.connect('mongodb+srv://k9202ky:k200891359d@cluster0.2pgtsea.mongodb.net/?tls=true', {
    });
    console.log('MongoDB connected successfully');

    // 測試數據庫連接
    await mongoose.connection.db.admin().ping();
    console.log('Database connection is responsive');

    // 啟動服務器
    const port = process.env.PORT || 3001; // 使用 3001 或其他可用端口
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB or start server:', error);
    process.exit(1);
  }
};

connectDBAndStartServer();

module.exports = app;