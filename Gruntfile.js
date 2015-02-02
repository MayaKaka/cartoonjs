module.exports = function(grunt) {
	"use strict";

	// load npm tasks
	grunt.loadNpmTasks('grunt-contrib-requirejs');

	var fs = require('fs'),
		path = require('path'),
		pkg = grunt.file.readJSON('package.json');

	var	requirejs = {
		  	compile: {
		    	options: {
		            baseUrl: './src',
		            dir: './build',
					optimize: 'none', 
		            skipDirOptimize: true,
		            generateSourceMaps: false,
		            preserveLicenseComments: false,
		            // useSourceUrl: true,
		            shim: {
		            	
		            },
		            modules: [
		            	{ name: 'cartoon' },
		            	{ name: 'cartoon.test' },
		            	{ name: 'cartoon.box2d', exclude: [ 'cartoon' ] },
		            	{ name: 'cartoon.filters', exclude: [ 'cartoon' ] },
		            	{ name: 'cartoon.particles', exclude: [ 'cartoon' ] },
		            	{ name: 'cartoon.three', exclude: [ 'cartoon' ] }

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
			
			'animation/Ease', 'animation/Tween', 
			'animation/Movement', 
			'animation/Timeline', 
			'animation/Sprite', 
			'animation/ParticleEmitter', 'animation/ParticleSystem',

			'tilemap/PathFinder'
		];

		fs.readdirSync(root).forEach(function(a) {
			a = path.join(root, a);
			if (!/cartoon\./.test(a)) {
				console.log(a);
				grunt.file.delete(a);
			}
		});

		var arr = (function(){
			var a = [];
			var path = root + '/cartoon.js';
			a.push({ 
				path: path,
				data: grunt.file.read(path) 
			});
			return a;
		})();

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