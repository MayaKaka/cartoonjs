var express = require('express');
var http = require('http');

var router = module.exports = express.Router();

/* 代理百度请求 */
router.get('/', function(req, res) {
    var opt = {
        // host: 'cp01-psfe-setest0.cp01.baidu.com',
        // port: '8012',
        host:'www.baidu.com',
        port:'80',
        method:'GET',    //这里是发送的方法
        path: req.path,  //这里是访问的路径
        headers:{
            //这里放期望发送出去的请求头
            "Content-Type": 'application/x-www-form-urlencoded'
        }
    };
    
    //以下是接受数据的代码
    var body = '';
    var request = http.request(opt, function(response) {
        console.log("Got response from " + opt.host + ": " + response.statusCode);
        response.on('data',function(dat){
            body += dat;
        }).on('end', function(){
            res.send(body);
        });
    }).on('error', function(e) {
        console.log("opt error: " + e.message);
    });

    request.write("\n");
    request.end();
});
