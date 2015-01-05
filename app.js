
var express = require('express');
var app = express();

var config = {
    routes: [
        's': ''
    ]
    port: 80
};

app.use('/', express.static(__dirname + '/'));

app.listen(config.port);


function getLocalIP() {
    var os = require('os'),
        ifaces = os.networkInterfaces(),
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
