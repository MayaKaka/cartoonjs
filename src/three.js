
define( function ( require, exports, module ) {
	"use strict";
	   
var base = require('cartoon');

base.expand({
	
	// THREE库文件
	THREE: require('webgl/THREE'),
	Object3D: require('webgl/Object3D'),
	GLCanvas: require('webgl/GLCanvas'),
	TransformControls: require('webgl/TransformControls')
	
});

return base;
});