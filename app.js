var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Mongoose 連接
mongoose.connect('mongodb+srv://k9202ky:k200891359d@cluster0.2pgtsea.mongodb.net/?tls=true')
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

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

module.exports = app;
