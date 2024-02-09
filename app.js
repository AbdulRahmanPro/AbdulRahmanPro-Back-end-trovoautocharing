var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var mongoose = require('mongoose')
var port = 3000
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mongoDbUri = 'mongodb+srv://cluster0.aemomw3.mongodb.net/?retryWrites=true&w=majority';
var app = express();
const WebSocket = require('ws');
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

mongoose
  .connect(mongoDbUri, {
    user: 'trovomanagementsaifi',
    pass: '0rywJ7ElGPUZG8Ks',
  })
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(port, () => {
      console.log(`App and WebSocket server are listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

  mongoose.connection.once('open', function() {
    console.log('MongoDB database connection established successfully');
  
    // مراقبة تغييرات MongoDB مع fullDocument للحصول على الوثيقة الكاملة
    const changeStream = mongoose.connection.collection('actions').watch([{ $match: { 'operationType': { $in: ['update', 'replace', 'insert'] } } }], { fullDocument: 'updateLookup' });
    
    changeStream.on('change', (change) => {
      console.log('Change detected in MongoDB:', change);
      // تحقق من نوع العملية قبل الإرسال
      if (change.fullDocument) {
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(change.fullDocument)); // إرسال الوثيقة المحدثة
          }
        });
      }
    });
  
    // عندما يتصل عميل جديد بWebSocket
    wss.on('connection', function connection(ws) {
      console.log('A new WebSocket client connected.');
  
      // إرسال البيانات الحالية إلى العميل
      mongoose.connection.collection('actions').findOne({}, (error, doc) => {
        if (error) {
          ws.send(JSON.stringify({ error: 'Unable to fetch data' }));
        } else {
          ws.send(JSON.stringify(doc)); // إرسال السجل الحالي إلى العميل
        }
      });
    });
  });
  
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
