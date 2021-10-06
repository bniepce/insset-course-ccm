let express       = require('express'),
    path          = require('path'),
    cors          = require('cors'),
    cookieParser  = require('cookie-parser'),
    logger        = require('morgan'),
    db            = require('./app/models/db')


let article = require('./routes/article');


let app = express();


app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ROUTERS
app.use('/', article);

// CATCH ERROR 
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // RENDER ERROR PAGE
    res.status(err.status || 500);
    res.json({'message': 'error'});
});

module.exports = app;
