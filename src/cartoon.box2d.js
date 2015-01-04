
define( function ( require, exports, module ) {
	"use strict";
	   
var cartoon = require('cartoon');

cartoon.expand({
	// Box2D库文件
	Box2D: require('physics/Box2D'),
	PhysicsWorld: require('physics/PhysicsWorld')
});

return cartoon;
});