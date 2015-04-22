var express = require('express');
var jade = require('jade');
var fs = require('fs');
var unzip = require('unzip');
var conf = require('../../conf');
var Canvas = require('canvas');
var Image = Canvas.Image;

/*
var cvs = new Canvas(20, 20, 'png');
var ctx = cvs.getContext('2d');
ctx.fillStyle = '#ececec';
ctx.fillRect(0, 0, 10, 10);
ctx.fillRect(10, 10, 10, 10);
fs.writeFile('app/statics/home/img/bg.png', cvs.toBuffer());
*/

var router = module.exports = express.Router();

var output = conf.root + '/' + conf.projects,
    outurl = '/static/projects';

router.get('/', function(req, res) {
    res.send(jade.renderTpl('sprite', { title: 'sprite' }));
});

router.post('/upload', function(req, res) {
    var files = req.files;
    var list = [];
    var isZip = false;
    var cmd = req.body.cmd;

    var pname = req.body.pname,
        sname = req.body.sname;

    var paths = {
        output: output + '/' + pname +'/ani/' + sname,
        outurl: outurl + '/' + pname +'/ani/' + sname
    }

    if (cmd === 'comm') {
        res.send('complete!');
        return;
    }

    for (var i in files) {
        if (files[i].extension === 'zip') {
            isZip = true;
            fs.mkdirSync(paths.output);
            fs.createReadStream(files[i].path).pipe(unzip.Extract({ path: paths.output })).on('close', function() {
                files = fs.readdirSync(paths.output);
                files.forEach(function(a) {
                    list.push({
                        originalname: a,
                        path: paths.output + '/' + a
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
        if (!isZip) fs.mkdirSync(paths.output);
        try {
            if (cmd === 'merge') {
                paths.useTrim = true;
                paths.forMerge = true;
                res.send(merge(paths, list));
            } else if (cmd === 'trim') {
                res.send(trim(paths, list));
            } else if (cmd === 'flip') {
                res.send(flip(paths, list));
            }
        } catch (e) {
            console.log(e.stack);
        }
    }

    if (!isZip) exec();
});

function merge(paths, files) {
    var images = [];
    var name, data, img, idx;

    files.forEach(function(a, i) {
        name = a.originalname;
        idx = name.match(/[0-9]+(?=[^0-9]*$)/);
        if (idx) {
            idx = parseFloat(idx[0]);
        } else {
            idx = 0;
        }
        if (paths.useTrim) {
            img = trim(paths, [ a ]);
            images.push({
                idx: idx, image: img.data, width: img.originRect[2], height: img.originRect[3], translateX: img.originRect[0], translateY: img.originRect[1]
            })
        } else {
            data = fs.readFileSync(a.path);
            images.push({
                idx: idx, image: data, width: img.width, height: img.height, translateX: 0, translateY: 0
            });
        }
        
        fs.unlink(a.path);
    });

    images.sort(function(a, b) {
        return a.idx - b.idx;
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
    
    var len = images.length;
    images = [];
    canvases.forEach(function(a, i) {
        var fileName = i + '.png';
        fs.writeFileSync(paths.output + '/' + fileName, canvases[i].toBuffer());
        images.push(paths.outurl + '/' + fileName);
    });

    var result = {
        images: images,
        frames: frames,
        offsetX: 0,
        offsetY: 0,
        animations: {
            all: [0, len-1, true, len*60]
        }
    };
    fs.writeFile(paths.output + '/ss.json', JSON.stringify(result));
    return result;
}

function trim(paths, files) {
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

    if (!paths.forMerge) {
        fs.writeFile(paths.output + '/' + name, mini.toBuffer());
    }

    var result = {
        image: paths.outurl + '/' + name,
        data: mini,
        sourceRect: [0, 0, canvas.width, canvas.height],
        originRect: rect
    };
    return result;
}
