const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
require('dotenv').config(); // 載入環境變數

// 引入路由
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// 創建 Express 應用
const app = express();

// 資料庫連接緩存
let cachedDb = null;

// 資料庫連接函數
const connectToDatabase = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 6000,
      socketTimeoutMS: 45000,
      bufferCommands: true,
    });

    cachedDb = db;
    console.log('MongoDB 連接成功');
    return db;
  } catch (error) {
    console.error('MongoDB 連接錯誤:', error);
    throw error;
  }
};

// 帶有重試機制的資料庫連接函數
const connectWithRetry = async (retries = 5) => {
  try {
    await connectToDatabase();
    if (mongoose.connection.readyState !== 1) {
      throw new Error('資料庫連接未完全建立');
    }
  } catch (error) {
    if (retries > 0) {
      console.log(`重試連線，剩餘嘗試次數: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectWithRetry(retries - 1);
    }
    throw error;
  }
};

// 設置視圖引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 中間件設置
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// CORS 設置
app.use(cors({
  origin: ['https://www.creamlady.com', 'https://creamlady.com'],
  credentials: true
}));

// Session 設置
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // 1 天
  }),
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 } // 24 小時
}));

// robots.txt 路由
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

// keep-warm 路由
app.get('/keep-warm', async (req, res) => {
  console.log('保持應用溫暖:', new Date().toISOString());
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectWithRetry();
    }
    
    if (mongoose.connection.readyState === 1) {
      const adminDb = mongoose.connection.db.admin();
      await adminDb.ping();
      console.log('資料庫連接正常');
      res.send('應用程式和資料庫連接都已保持溫暖');
    } else {
      res.status(503).send('資料庫連接異常');
    }
  } catch (error) {
    console.error('keep-warm 路由錯誤:', error);
    res.status(500).send('保持應用程式溫暖時出錯');
  }
});

// 資料庫連接中間件
app.use(async (req, res, next) => {
  try {
    await connectWithRetry();
    next();
  } catch (error) {
    next(error);
  }
});

// 路由設置
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Contact 頁面路由渲染
app.get('/contact', (req, res) => { 
  res.render('contact', { GOOGLE_MAP_API_KEY: process.env.GOOGLE_MAP_API_KEY });
});

// 404 錯誤處理
app.use(function(req, res, next) {
  next(createError(404));
});

// 錯誤處理中間件
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// 啟動服務器函數
const startServer = async () => {
  try {
    // 檢查必要的環境變數
    if (!process.env.MONGODB_URI) {
      throw new Error('請設定 MONGODB_URI 環境變數');
    }

    // 初始資料庫連接
    await connectWithRetry();

    // 設置 Mongoose 連接事件監聽器
    mongoose.connection.on('connected', () => {
      console.log('Mongoose 連線已建立');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose 連線錯誤:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose 連線已斷開');
    });

    // 定期檢查並保持連接
    setInterval(async () => {
      try {
        if (mongoose.connection.readyState !== 1) {
          console.log('檢測到資料庫連接斷開，嘗試重新連接...');
          await connectWithRetry();
        }
      } catch (error) {
        console.error('定期連接檢查失敗:', error);
      }
    }, 5 * 60 * 1000); // 每 5 分鐘檢查一次

    // 啟動服務器
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`服務器運行在端口 ${port}`);
    });
  } catch (error) {
    console.error('啟動服務器失敗:', error);
    process.exit(1);
  }
};

// 處理未捕獲的 Promise 拒絕
process.on('unhandledRejection', (reason, promise) => {
  console.error('未處理的 Promise 拒絕:', promise, '原因:', reason);
  // 可以在這裡選擇退出程序或採取其他措施
});

// 啟動服務器
startServer();

module.exports = app;
