var os = require('os');
var express = require('express');
var app = express();
var port = 80;

app.use('/',express.static(__dirname + '/'));

app.listen(port);

function getLocalIP() {
    var ifaces = os.networkInterfaces(),
    	arr;

    for (var i in ifaces) {
    	arr = ifaces[i];
    	arr.forEach(function (a) {
    		var head = parseFloat(a.address.split('.')[0]);
    		if (head && head !== 127) {
    			console.log('listen ' + a.address + ':'+80);
    		}
    	})
    }
}

getLocalIP();
