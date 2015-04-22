module.exports = function(grunt) {
    "use strict";

    // load npm tasks
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    var fs = require('fs'),
        path = require('path'),
        pkg = grunt.file.readJSON('package.json');

    var requirejs = {
              compile: {
                options: {
                    baseUrl: './src',
                    dir: './build',
                    optimize: 'uglify2', // 'none', //
                    skipDirOptimize: true,
                    generateSourceMaps: false,
                    preserveLicenseComments: false,
                    // useSourceUrl: true,
                    shim: {
                        
                    },
                    modules: [
                        { name: 'cartoon' },
                        { name: 'cartoon.private' },
                        { name: 'cartoon.filter', exclude: [ 'cartoon', 'display/Bitmap' ] },
                        { name: 'cartoon.particle', exclude: [ 'cartoon', 'base', 'display/DisplayObject', 'display/Bitmap', 'shapes/Shape' ] },
                        { name: 'cartoon.ui', exclude: [ 'cartoon', 'display/DisplayObject', 'display/Bitmap' ] },
                        { name: 'cartoon.box2d', exclude: [ 'cartoon', 'display/DisplayObject' ] },
                        { name: 'cartoon.three', exclude: [ 'cartoon', 'core/Preload', 'display/StyleSheet', 'display/DisplayObject', 'anim/Tween' ] }

                    ]
                }
              }
        };

    // Project configuration.
    grunt.initConfig({
          pkg: pkg,
          requirejs: requirejs
    });

    grunt.task.registerTask('foo', 'A sample task that logs stuff.', function(arg1, arg2) {
        var fs = require('fs'),
            root = __dirname + '/build';
        var all = [
            'core/Class', 'core/Ticker', 
            'core/TagCollection', 
            'core/EventDispatcher',
            'core/Loader', 'core/Preload', 
            'core/UserData', 
            'core/Matrix2D',
            
            'display/StyleSheet', 'display/DisplayObject',
            'display/Stage', 'display/Canvas',
            'display/Graphics2D', 'display/Shape',
            'display/Filter', 'display/Bitmap',
            'display/Text', 
            
            'shapes/Rect', 
            'shapes/Circle', 
            'shapes/Line',
            'shapes/Ploygon',

            'anim/Animation', 
            'anim/Ease', 'anim/Tween', 
            'anim/Movement',
            'anim/Timeline',
            'anim/Sprite',
            'anim/ParticleEmitter', 'anim/ParticleSystem',

            'ui/Viewer',
            'ui/Button',
            'ui/TextField',

            'tilemap/PathFinder'
        ];

        var arr = [];

        fs.readdirSync(root).forEach(function(a) {
            a = path.join(root, a);
            if (!/cartoon\./.test(a)) {
                grunt.file.delete(a);
            } else {
                arr.push({
                    path: a,
                    data: grunt.file.read(a)
                })
            }
        });

        all.forEach(function(a, i) {
            arr.forEach(function(b, j) {
                b.data = b.data.replace(new RegExp(a, 'g'), '_' + i);
            });
        });
        arr.forEach(function(b, j) {
            grunt.file.write(b.path, b.data);
        });
        
    });

      // register default tasks
      grunt.registerTask('default', ['requirejs', 'foo']);

};