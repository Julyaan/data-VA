var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mime = require("mime");

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var mongoose = require('mongoose');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//连接数据库
var db='mongodb://127.0.0.1:27017/myDB'  //数据库地址+数据库名
mongoose.connect(db);
//连接状态日志
mongoose.connection.on('connected',function(){
   console.log('Mongoose connected to '+ db);
});
mongoose.connection.on('error',function(err){
    console.log('Mongoose connection error: '+ err);
});
mongoose.connection.on('disconnected',function(){
    console.log('Mongoose disconnected ');
});

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
