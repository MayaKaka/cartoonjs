var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var jade = require('jade');
var fs = require('fs');
var os = require('os');
var conf = require('./conf');

jade.__caches = {};
jade.renderTpl = function(view, data) {
    var tplPath = path.join(conf.views, view);
    if (conf.debug) {
        return jade.renderFile(tplPath + '.jade', data);
    }

    var fn = jade.__caches[view],
        options = {};

    if (!fn) {
        fn = jade.__caches[view] = jade.compileFile(tplPath + '.jade', options);
    }
    return fn(data);
}

var app = express();
// view engine setup
app.set('views', path.join(conf.root, conf.views));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(conf.root + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ dest: path.join(conf.root, conf.uploads)}));
app.use(cookieParser());
// app.use(require('stylus').middleware(path.join(conf.root, conf.statics)));
app.use('/static', express.static(path.join(conf.root, conf.statics)));

// app.use('/', routes);
// app.use('/users', users);
// 配置静态模块
conf.modules.forEach(function(a, i) {
    app.use('/' + a, express.static(path.join(conf.root, a)));
});

// 配置动态路由
var routes = path.join(conf.root, conf.routes),
    files = fs.readdirSync(routes),
    reg = /\.js$/,
    route;

if (files.length) {
    files.forEach(function(a, i) {
        if (reg.test(a)) {
            a = a.replace(reg, '');
            // 防止模块加载异常
            try {
                route = require(path.join(routes, a));
                if (route) {
                    if (a === 'index') {
                        app.use('/', route);
                    }
                    // 伪静态便于seo
                    app.use(['/' + a, '/' + a + '.html'], route);
                }
            } catch (e) {
                console.log(e.stack);
            }
        }
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

app.listen(conf.port);

// 显示内网/局域网 IP
var getLocalIP = function () {
    var ifaces = os.networkInterfaces(),
        arr;

    for (var i in ifaces) {
        arr = ifaces[i];
        arr.forEach(function (a) {
            var head = parseFloat(a.address.split('.')[0]);
            if (head <= 270 && head !== 127) {
                console.log('listen ' + a.address + ':' + conf.port);
            }
        })
    }
}

getLocalIP();