
define( function ( require, exports, module ) {
	"use strict";
	   
var cartoon = require('cartoon');

// THREE库文件
cartoon.THREE = require('webgl/THREE');
cartoon.Object3DFactory = require('webgl/Object3DFactory');
cartoon.GLCanvas = require('webgl/GLCanvas');

return cartoon;
});