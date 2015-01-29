module.exports = function(grunt) {
	"use strict";

	// load npm tasks
	grunt.loadNpmTasks('grunt-contrib-requirejs');
  	grunt.loadNpmTasks('grunt-contrib-uglify');

	var pkg = grunt.file.readJSON('package.json');

	var	requirejs = {
		  	compile: {
		    	options: {
		      		baseUrl: 'src',
		      		// mainConfigFile: "buildConfig.js",
		      		name: 'cartoon',
		      		out: 'build/cartoon.js',
		      		optimize: 'none'
		    	}
		  	}
		};

	var uglify =  {
	    	options: {
	      		banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
	    	},
	    	build: {
	    		files: {
	    			'build/cartoon.js': ['build/cartoon.js'],
	    			'build/cartoon.filters.js': ['src/cartoon.filters.js'],
	    			'build/cartoon.particles.js': ['src/cartoon.particles.js'],
	    			'build/cartoon.ui.js': ['src/cartoon.ui.js'],
	    			'build/cartoon.box2d.js': ['src/cartoon.box2d.js'],
	    			'build/cartoon.three.js': ['src/cartoon.three.js']
	    		}
	    	}
	  	};

	// Project configuration.
	grunt.initConfig({
	  	pkg: pkg,
	  	requirejs: requirejs,
	  	uglify: uglify
	});

	grunt.task.registerTask('foo', 'A sample task that logs stuff.', function(arg1, arg2) {
		var fs = require('fs'),
			root = __dirname + '/build';
		var all = [
			'core/Class', 'core/Ticker', 'core/TagCollection', 'core/EventDispatcher',
			'core/Loader', 'core/Preload', 'core/UserData', 'core/Matrix2D',
			'display/StyleSheet', 'display/DisplayObject', 'display/Graphics2D',
			'display/Filter',
			'display/Stage', 'display/Canvas', 'display/Graphics2D', 'display/Shape',
			'display/Bitmap', 'display/Text', 
			'animation/Ease', 'animation/Tween', 
			'animation/Movement', 'animation/Timeline', 'animation/Sprite', 
			'animation/ParticleEmitter', 'animation/ParticleSystem'
		];
		var arr = (function(){
			var a = [];
			/*
			grunt.file.recurse(root, function(abspath, rootdir, subdir, filename) {
				a.push({ 
					path: abspath,
					data: grunt.file.read(abspath) 
				});
			})
			*/
			var path = root + '/cartoon.js';
			a.push({ 
				path: path,
				data: grunt.file.read(path) 
			});
			return a;
		})();
		all.forEach(function(a, i) {
			arr.forEach(function(b, j) {
				b.data = b.data.replace(new RegExp(a, 'g'), '~' + i);
			});
		});
		arr.forEach(function(b, j) {
			grunt.file.write(b.path, b.data);
		});
		
	});

  	// register default tasks
  	grunt.registerTask('default', ['requirejs', 'uglify', 'foo']);

};