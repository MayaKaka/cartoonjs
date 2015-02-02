
define( function ( require, exports, module ) {
	"use strict";
	   
var cartoon = require('base');

cartoon.extend({
	
	// 基础组件
	Class: require('core/Class'),
	Ticker: require('core/Ticker'),
	Preload: require('core/Preload'),
	
	// 渲染组件
	StyleSheet: require('display/StyleSheet'),
	DisplayObject: require('display/DisplayObject'),
	Stage: require('display/Stage'),
	Shape: require('display/Shape'),
	Filter: require('display/Filter'),
	Bitmap: require('display/Bitmap'),
	
	// 动画组件
	Tween: require('animation/Tween'),
	Movement: require('animation/Movement'),
	Sprite: require('animation/Sprite'),

	// 扩展
	PathFinder: require('tilemap/PathFinder')

});

cartoon.extend({

	setRenderMode: function(mode) {
		var proto = this.DisplayObject.prototype;

		if (mode === 'canvas' || mode === 1) {
			proto.renderMode = 1;
		} else {
			proto.renderMode = 0;
		}
	}

})

return cartoon;
});