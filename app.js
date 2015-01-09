var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var os = require('os');

// var routes = require('./routes/index');
// var users = require('./routes/users');

var app = express();
var config = {
    modules: ['build', 'editor', 'examples', 'src', 'test'],
    statics: 'app/public',
    routes: 'app/routes',
    views: 'app/views',
    port: 80
};

// view engine setup
app.set('views', path.join(__dirname, config.views));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(require('stylus').middleware(path.join(__dirname, config.statics)));
app.use('/static', express.static(path.join(__dirname, config.statics)));

// app.use('/', routes);
// app.use('/users', users);
// 配置静态模块
config.modules.forEach(function(a, i) {
    app.use('/' + a, express.static(path.join(__dirname, a)));
});

// 配置动态路由
var routes = path.join(__dirname, config.routes),
    files = fs.readdirSync(routes),
    route;

if (files.length) {
    files.forEach(function(a, i) {
        a = a.replace(/\.js$/g, '');
        route = require(path.join(routes, a));
        if (a === 'index') {
            app.use('/', route);
        }
        app.use(['/' + a, '/' + a + '.html'], route);
    });
}
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(config.port);

module.exports = app;

// 显示内网/局域网 IP
var getLocalIP = function () {
    var ifaces = os.networkInterfaces(),
        arr;

    for (var i in ifaces) {
        arr = ifaces[i];
        arr.forEach(function (a) {
            var head = parseFloat(a.address.split('.')[0]);
            if (head <= 270 && head !== 127) {
                console.log('listen ' + a.address + ':' + config.port);
            }
        })
    }
}

getLocalIP();