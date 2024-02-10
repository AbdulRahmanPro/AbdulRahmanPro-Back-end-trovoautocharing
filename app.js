require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const indexRouter = require('./routes/index');
const usersRouter  = require('./routes/users')
const cors = require('cors');
const app = express();
const Action = require('./module/actions');
const port = 3000;
var mongoDbUri = 'mongodb+srv://cluster0.aemomw3.mongodb.net/?retryWrites=true&w=majority';
mongoose
  .connect(mongoDbUri, {
    user: 'trovomanagementsaifi',
    pass: '0rywJ7ElGPUZG8Ks',
  })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`app is listening on port ${port}`);
    });
    const changeStream = mongoose.connection.collection('actions').watch();
    changeStream.on('change', (change) => {
      console.log('Change detected in MongoDB:', change);
      // sendActionUpdate();
    });
  })
    .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });




app.use(cors());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/auth', usersRouter);
app.get('/api/actions', function (req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*' // هذا يسمح بالوصول من أي أصل
    // 'Access-Control-Allow-Origin': 'https://trovo.live' // أو استخدم أصل محدد إذا أردت مزيدًا من الأمان
});

  const sendAction = () => {
    Action.findOne().sort({ createdAt: -1 }).then(action => {
      if (action) {
        res.write(`data: ${JSON.stringify(action)}\n\n`);
      }
    }).catch(error => {
      console.error('Error retrieving action:', error);
      res.end();
    });
  };

  sendAction(); // Send immediately on client connect
  const changeStream = mongoose.connection.collection('actions').watch();
  changeStream.on('change', (change) => {
    console.log('Change detected in MongoDB:', change);
    sendAction(); // Send on database change
  });

  req.on('close', () => {
    changeStream.close();
  });
});
// التعامل مع الأخطاء 404
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  // تعيين رسالة الخطأ والمعلومات في الوسيطات المحلية للصفحة
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // عرض صفحة الخطأ أو إرسال استجابة JSON بناءً على احتياجاتك
  res.status(err.status || 500);

  // إذا كنت ترغب في عرض صفحة HTML للخطأ:
  res.render('error'); // يجب التأكد من وجود ملف "error.ejs" في مجلد العرض

  // إذا كنت ترغب في إرسال استجابة JSON للخطأ:
  // res.json({ error: err.message });
});

module.exports = app;
