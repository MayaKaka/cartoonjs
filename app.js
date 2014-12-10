var os = require('os');
var express = require('express');
var app = express();

app.use('/',express.static(__dirname + '/'));

app.listen(80);

function getLocalIP() {
    var ifaces = os.networkInterfaces(),
    	arr;

    for (var i in ifaces) {
    	arr = ifaces[i];
    	arr.forEach(function (a) {
    		var head = parseFloat(a.address.split('.')[0]);
    		if (head && head !== 127) {
    			console.log('listen ' + a.address + ':80');
    		}
    	})
    }
}

getLocalIP();