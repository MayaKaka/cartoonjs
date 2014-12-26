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
	    			'build/all/cartoon.js': ['build/cartoon.js'],
	    			'build/all/filters.js': ['src/filters.js'],
	    			'build/all/particles.js': ['src/particles.js'],
	    			'build/all/box2d.js': ['src/box2d.js'],
	    			'build/all/three.js': ['src/three.js']
	    		}
	    	}
	  	};

	// Project configuration.
	grunt.initConfig({
	  	pkg: pkg,
	  	requirejs: requirejs,
	  	uglify: uglify
	});

  	// register default tasks
  	grunt.registerTask('default', ['requirejs', 'uglify']);

};