module.exports = null; return;

var fs = require('fs');
var Canvas = require('canvas');
var express = require('express');
var Image = Canvas.Image;
var router = express.Router();


var canvas = new Canvas(200,200,'png')
  , ctx = canvas.getContext('2d');

ctx.font = '30px Impact';
// ctx.rotate(.1);
// ctx.fillText("Awesome!", 50, 100);

ctx.strokeStyle = '#ffff00';
ctx.strokeRect(50.5, 50.5, 100, 80);

var te = ctx.measureText('Awesome!');
/*
ctx.strokeStyle = 'rgba(0,0,0,0.5)';
ctx.beginPath();
ctx.lineTo(50, 102);
ctx.lineTo(50 + te.width, 102);
ctx.stroke();*/


router.get('/', function(req, res) {
  res.render('user', { title: 'User' });
});

router.get('/data', function(req, res) {
  res.send('<img src="'+canvas.toDataURL()+'">'+JSON.stringify(data));
});



// fs.writeFile('out.png', canvas.toBuffer());

var data = ctx.getImageData(0,0,canvas.width,canvas.height).data;

var arr = [];
for (var j=0; j < canvas.height; j++) {
    arr[j] = [];
    for (var i=0; i< canvas.width; i++) {
        var idx = 4*(j*canvas.width+i);
        if (data[idx] === 0 && data[idx+1] === 0 && data[idx+2] === 0 && data[idx+3] === 0) {
            arr[j][i] = 0;
        } else {
            arr[j][i] = 1;
        }
    }
}


var sy, flag = false;
for (var j=0; j < canvas.height; j++) {
    flag = false;
    for (var i=0; i< canvas.width; i++) {
        if (arr[j][i]) {
            flag = true;
            break;
        }
    }
    if (flag) {
        sy = j;
        break;
    }
}

var ey;
for (var j = canvas.height-1; j >=0; j--) {
    flag = false;
    for (var i=0; i< canvas.width; i++) {
        if (arr[j][i]) {
            flag = true;
            break;
        }
    }
    if (flag) {
        ey = j;
        break;
    }
}

var sx;
for (var i=0; i<canvas.width; i++) {
    flag = false;
    for (var j=0; j<canvas.height; j++) {
        if (arr[j][i]) {
            flag = true;
            break;
        }
    }
    if (flag) {
        sx = i;
        break;
    }
}

var ex;
for (var i=canvas.width-1; i>=0; i--) {
    flag = false;
    for (var j=0; j<canvas.height; j++) {
        if (arr[j][i]) {
            flag = true;
            break;
        }
    }
    if (flag) {
        ex = i;
        break;
    }
}

var rect = [sx, sy, ex+1-sx, ey+1-sy];
var bak = new Canvas(rect[2], rect[3], 'png');
bak.getContext('2d').drawImage(canvas, rect[0], rect[1], rect[2], rect[3], 0, 0, rect[2], rect[3]);


// fs.writeFile('out2.png', bak.toBuffer());

module.exports = router;