var express = require('express');
var jade = require('jade');
var fs = require('fs');
var conf = require('../../conf');

var router = module.exports = express.Router();

var statics = conf.root + '/' + conf.statics,
    output = conf.root + '/' + conf.projects,
    outurl = '/static/projects';

router.get('/', function(req, res) {
    res.send(jade.renderTpl('editor', { }));
});

router.get('/create-project', function(req, res) {
    var pname = req.query.pname;
    var pjPath = output + '/' + pname;

    fs.exists(pjPath, function(exists){
        if (exists) {
            res.send({
                status: 0,
                msg: '该工程已存在'
            });
        } else {
            fs.mkdir(pjPath, function(err) {
                if (err) {
                    res.send({
                        status: 0,
                        msg: '创建工程失败',
                        error: err
                    });
                } else {
                    var conf = {
                        name: pname,
                        path: outurl + '/' + pname + '/',
                        date: new Date().getTime()
                    };
                    fs.writeFile(pjPath + '/project.json', JSON.stringify(conf));
                    fs.mkdir(pjPath + '/res');
                    fs.mkdir(pjPath + '/ani');
                    fs.mkdir(pjPath + '/export');
                    res.send({
                        status: 1,
                        msg: '创建成功'
                    });
                }
            })
        }
    });
});

router.get('/load-project', function(req, res) {
    var pname = req.query.pname;
    var path = output + '/' + pname;

    fs.readFile(path + '/project.json', function(err, data) {
        if (err) return;
        res.send(JSON.parse(data));
    });
});

router.post('/save-project', function(req, res) {
    var pname = req.body.pname;
    var data = req.body.pdata;
    var path = output + '/' + pname;
    
    fs.writeFile(path + '/project.json', data);

    res.send('success');
});

router.get('/export-project', function(req, res) {
    var pname = req.query.pname;
    var path = output + '/' + pname;
    var url = outurl + '/' + pname;
    var staticUrl = '/static';
    var exportPath = path + '/export';

    fs.readFile(path + '/project.json', 'utf-8', function(err, data) {
        if (err) return;
        data = 'define(function(require){ return '+ data.replace(/(\s*)\\n(\s*)/g, '') +'; })';
        var reg = new RegExp(staticUrl + '([a-zA-Z0-9-_/]*)\.(jpg|png|gif)', 'g');
        data = data.replace(reg, function(str) {
            var str = str.replace(staticUrl, '');
            var name = str.replace('\/home\/', '').replace('\/projects\/'+pname+'\/', '');
            name = name.replace(/\//g, '_');
            fs.readFile(statics + str, function(err, data) {
                if (err) console.log(err);
                else fs.writeFile(exportPath + '/' + name, data);
            });
            return name;
        });
        data = data.replace(url, 'http://localhost' + url + '/export/');
        fs.writeFile(exportPath + '/pdata.js', data);
    });

    res.send('success');
});

router.get('/load-sprite', function(req, res) {
    var pname = req.query.pname;
    var path = output + '/' + pname +'/ani';

    fs.readdir(path, function(err, sprites) {
        sprites = sprites || [];
        sprites.forEach(function(a, i) {
            try {
                var data = fs.readFileSync(path + '/' + a + '/ss.json', 'utf-8');
                sprites[i] = { name: a, data: JSON.parse(data) };
            } catch (e) {
                sprites[i] = { name: 'error', data: { images: ['/static/home/img/bear.png'], frames: [[0, 0, 120, 120, 0, 0, 0]] }}
            }
        });
        res.send(sprites);
    });
});

router.get('/load-resource', function(req, res) {
    var pname = req.query.pname;
    var path = output + '/' + pname +'/res' + req.query.path;

    fs.readdir(path, function(err, assets) {
        assets = assets || [];
        assets.forEach(function(a, i) {
            assets[i] = { name: a, isParent: !(/\.[a-zA-z0-9]+$/g).test(a), path: req.query.path + '/' + a };
        });
        res.send(assets);
    });
});

router.post('/upload-resource', function(req, res) {
    var pname = req.body.pname;
    var files = req.files;
    var path = req.body.path || '';
    var paths = {
        output: output + '/' + pname +'/res',
        outurl: outurl + '/' + pname +'/res'
    };

    var file, tmp_path, target_path;

    for (var i in files) {
        file = files[i];
        tmp_path = file.path;
        
        target_path = paths.output + path + '/' + file.originalname;

        fs.rename(tmp_path, target_path, function(err) {
            if (err) {
                console.error(err);   
            } else {
                fs.unlink(tmp_path, function() {
                    if (err) throw err;
                });
            }
        });
    }

    res.send('success');
});

router.get('/create-folder', function(req, res) {
    var pname = req.query.pname;
    var path = output + '/' + pname +'/res' + req.query.path;

    fs.mkdir(path);
    res.send('success');
});