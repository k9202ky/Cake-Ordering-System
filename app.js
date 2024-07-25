const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config(); // 確保 dotenv 被正確加載

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();


app.get('/keep-warm', (req, res) => {
  console.log('Keeping app warm:', new Date().toISOString());
  res.send('App is warm');
});

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

app.use(cors({  
  origin: process.env.FRONTEND_URL,
  credentials: true 
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

// 確保在渲染模板時傳遞 API 金鑰
app.get('/contact', (req, res) => { 
  res.render('contact', { GOOGLE_MAP_API_KEY: process.env.GOOGLE_MAP_API_KEY });
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
    await mongoose.connect(process.env.MongoURL, {});
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

module.exports = app;
