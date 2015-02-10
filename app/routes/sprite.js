var fs = require('fs');
var unzip = require('unzip');
var express = require('express');
var jade = require('jade');
var Canvas = require('canvas');
var Image = Canvas.Image;
var router = express.Router();

var output = 'app/statics/images/',
    outputUrl = '/static/images/';

router.get('/', function(req, res) {
    res.send(jade.renderTpl('sprite', { title: 'sprite' }));
});

router.post('/upload', function(req, res) {
    var files = req.files;
    var list = [];
    var isZip = false;
    var pid = new Date().getTime();
    var outpath = output + pid;

    for (var i in files) {
        if (files[i].extension === 'zip') {
            isZip = true;
            fs.mkdirSync(outpath);
            fs.createReadStream(files[i].path).pipe(unzip.Extract({ path: outpath })).on('close', function() {
                files = fs.readdirSync(outpath);
                files.forEach(function(a) {
                    list.push({
                        originalname: a,
                        path: outpath + '/' + a
                    });
                });
                exec();
            })
            fs.unlink(files[i].path);
            break;
        }
        list.push(files[i]);       
    }


    var exec = function() {
        var cmd = req.body.cmd;
        if (!isZip) fs.mkdirSync(output + pid);
        try {
            if (cmd === 'merge') {
                res.send(merge(pid, list, true));
            } else if (cmd === 'trim') {
                res.send(trim(pid, list));
            } else if (cmd === 'flip') {
                res.send(flip(pid, list));
            }
        } catch (e) {
            console.log(e.stack);
        }
    }

    if (!isZip) exec();
});

function merge(pid, files, useTrim) {
    var images = [];
    var name, data, img;

    files.forEach(function(a, i) {
        if (!name) {
            name = a.originalname;
        }

        if (useTrim) {
            img = trim(pid, [ a ], true);
            images.push({
                image: img.data, width: img.originRect[2], height: img.originRect[3], translateX: img.originRect[0], translateY: img.originRect[1]
            })
        } else {
            data = fs.readFileSync(a.path);
            images.push({
                image: data, width: img.width, height: img.height, translateX: 0, translateY: 0
            });
        }
        
        fs.unlink(a.path);
    });

    var frames = [],
        canvases = [],
        canvas, ctx;

    var maxWidth = 2048*1,
        maxHeight = 2048*100;

    images.forEach(function(a, i) {
        if (!canvas) {
            canvas = {
                sx: 0, sy: 0,
                width: 0, height: 0,
                lineHeight: 0 
            };
            canvases.push(canvas);
        }

        if (a.width + canvas.sx > maxWidth) {  
            canvas.sx = 0;
            canvas.sy += canvas.lineHeight;
            canvas.lineHeight = 0;
        }

        frames.push([canvas.sx, canvas.sy, a.width, a.height, canvases.length-1, a.translateX, a.translateY]);

        canvas.sx += a.width;
        canvas.lineHeight = Math.max(canvas.lineHeight, a.height);
        canvas.width = Math.max(canvas.width, canvas.sx);
        canvas.height = canvas.sy + canvas.lineHeight;
    });
    
    frames.forEach(function(a, i) {
        canvas = canvases[a[4]];
        if (!canvas.getContext) {
            canvases[a[4]] = new Canvas(canvas.width, canvas.height, 'png');
            canvas = canvases[a[4]];
            ctx = canvas.getContext('2d');
        }
        img = images[i];
        ctx.drawImage(img.image, a[0], a[1]);
    });
    /*
    var idx, diff = 1000;
    images.forEach(function(a, i) {
        idx = Math.floor(i/diff);
        if (!canvases[idx]) {
            canvases[idx] = { width: 0, height: 0 };
        }
        canvases[idx].width += a.width;
        canvases[idx].height = Math.max(canvases[idx].height, a.height);
    });

    canvases.forEach(function(a, i) {
        canvases[i] = new Canvas(a.width, a.height, 'png');
        canvases[i].ctx = canvases[i].getContext('2d');
        canvases[i].sx = 0;
    })

    images.forEach(function(a, i) {
        idx = Math.floor(i/diff);
        ctx = canvases[idx].ctx;
        ctx.drawImage(a.image, canvases[idx].sx, 0);
        frames.push([
            canvases[idx].sx, 0, a.width, a.height, idx, a.translateX, a.translateY
        ]);
        canvases[idx].sx += a.width;
    });
    */

    var len = images.length;
    images = [];
    canvases.forEach(function(a, i) {
        var fileName = i + '.png';
        fs.writeFileSync(output + pid + '/' + fileName, canvases[i].toBuffer());
        images.push(outputUrl + pid + '/' + fileName);
    });

    var result = {
        cmd: 'merge',
        images: images,
        frames: frames,
        offsetX: 0,
        offsetY: 0,
        animations: {
            all: [0, len-1, true, len*60]
        }
    };
    fs.writeFile(output + pid + '/ss.json', JSON.stringify(result));
    return result;
}

function trim(pid, files, forMerge) {
    var path = files[0].path,
        data = fs.readFileSync(path);

    var img = new Image;
    img.src = data;
    
    var canvas = new Canvas(img.width, img.height, 'png'),
        ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    data = ctx.getImageData(0,0,canvas.width,canvas.height).data;

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

    var rect = [sx, sy, ex+1-sx, ey+1-sy],
        mini = new Canvas(rect[2], rect[3], 'png'),
        name = new Date().getTime() + '.png';
    
    mini.getContext('2d').drawImage(canvas, rect[0], rect[1], rect[2], rect[3], 0, 0, rect[2], rect[3]);

    if (!forMerge) {
        fs.writeFile(output + pid + '/' + name, mini.toBuffer());
    }

    var result = {
        cmd: 'trim',
        image: outputUrl + pid + '/' + name,
        data: mini,
        sourceRect: [0, 0, canvas.width, canvas.height],
        originRect: rect
    };
    return result;
}

function flip(pid, files) {
    var path = files[0].path,
        data = fs.readFileSync(path);

    var img = new Image;
    img.src = data;
    
    var canvas = new Canvas(img.width, img.height, 'png');
    canvas.translate(img.width, 0);
    canvas.scale(-1, 1);
    canvas.drawImage(img, 0, 0);

    var name = new Date().getTime() + '.png';
    fs.writeFile(output + pid + '/' + name, canvas.toBuffer());

    var result = {
        cmd: 'flip',
        image: outputUrl + pid + '/' + name
    };
    return result;
}

module.exports = router;