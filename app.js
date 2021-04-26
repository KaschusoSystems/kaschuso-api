require('dotenv').config();

var express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    errorhandler = require('errorhandler'),
    morgan = require('morgan');

var isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
    sslkeylog = require('sslkeylog');
    sslkeylog.setLog('/tmp/keylogfile.txt').hookAll();
}

// Create global app object
var app = express();

app.use(cors());

// Normal express config defaults
morgan.token('url', function (req, res) { 
    const url = req.originalUrl || req.url;
    return url.replace(/(\?|&)password=[^&]*/, '$1password=' + '\x1b[31m' + 'hidden' + '\x1b[0m'); // color 'hidden' as red
});
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('method-override')());

if (!isProduction) {
    app.use(errorhandler());
}

require('./services/kaschuso-api');

app.use(require('./routes'));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
    app.use(function(err, req, res, next) {
        console.log(err.stack);

        res.status(err.status || 500);

        res.json({'errors': {
            message: err.message,
            error: err
        }});
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({'errors': {
        message: err.message,
        error: {}
    }});
});

// finally, let's start our server...
var server = app.listen( process.env.PORT || 3001, function(){
    console.log('Listening on port ' + server.address().port);
});
