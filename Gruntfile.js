module.exports = function(grunt) {
	"use strict";

	// Project configuration.
	grunt.initConfig({
	  	pkg: grunt.file.readJSON('package.json'),
	  	requirejs: {
		  	compile: {
		    	options: {
		      		baseUrl: "src",
		      		// mainConfigFile: "buildConfig.js",
		      		name: "<%= pkg.main %>",
		      		out: "build/<%= pkg.main %>.js",
		      		optimize: "none"
		    	}
		  	}
		},
	  	uglify: {
	    	options: {
	      		banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
	    	},
	    	build: {
	      		src: 'build/<%= pkg.main %>.js',
	      		dest: 'build/<%= pkg.main %>.min.js'
	    	}
	  	}
	});

	// load npm tasks
	grunt.loadNpmTasks('grunt-contrib-requirejs');
  	grunt.loadNpmTasks('grunt-contrib-uglify');

  	// register default tasks
  	grunt.registerTask('default', ['requirejs', 'uglify']);

};