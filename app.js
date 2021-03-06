var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const consolidate= require('consolidate')
var nuncjuck=require('nunjucks');
var indexRouter = require('./routes/index');
var totp_login = require('./routes/totpLogin');
var hotp_login = require('./routes/hotpLogin');
var cookieSession = require('cookie-session')

var app = express();

// view engine setup
app.engine('html',consolidate.nunjucks);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({
  name: 'session',
  keys: ['example', 'mysecret'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use('/', indexRouter);
app.use('/totp/login', totp_login)
app.use('/hotp/login', hotp_login)
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
