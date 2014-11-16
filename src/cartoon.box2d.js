
define( function ( require, exports, module ) {
	"use strict";
	   
var cartoon = require('cartoon');

// Box2D库文件
cartoon.Box2D = require('physics/Box2D');
cartoon.PhysicsWorld = require('physics/PhysicsWorld');

return cartoon;
});