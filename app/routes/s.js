var express = require('express');
var http = require('http');
var router = express.Router();

/* GET search data. */
router.get('/', function(req, res) {
    var opt = {
        host:'www.baidu.com',
        port:'80',
        method:'GET',    //这里是发送的方法
        path: req.path,  //这里是访问的路径
        headers:{
            //这里放期望发送出去的请求头
            "Content-Type": 'application/x-www-form-urlencoded',  
            // "Content-Length": data.length
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

module.exports = router;
