var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

var indexRouter = require('./routes/index');
var postRouter = require('./routes/post');
var commentRouter = require('./routes/comment');
var userRouter = require('./routes/user');

if (process.env.NODE_ENV != 'production')
  require('dotenv').config()  // import .env environment variable file

var app = express();

// ------- connecting PostgreSQL thru prisma -------
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const disconnectPrisma = async () => await prisma.$disconnect()  
// ------- connecting PostgreSQL thru prisma -------

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

app.use('/', indexRouter);
app.use('/v1/user/', userRouter);
app.use('/v1/posts/', postRouter);
app.use('/v1/comments/', commentRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(async function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  await disconnectPrisma()

  // render the error page
  res.status(err.status || 500);
  res.render('error');

});

module.exports = app;
