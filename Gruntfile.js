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
	    			'build/cartoon.min.js': ['build/cartoon.js'],
	    			'build/filters.js': ['src/display/filters.js'],
	    			'build/particles.js': ['src/animation/particles.js'],
	    			'build/three.js': ['src/cartoon.three.js']
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