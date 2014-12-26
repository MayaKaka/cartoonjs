
define( function ( require, exports, module ) {
	"use strict";
	   
var base = require('base');

base.expand({
	
	// 基础组件
	Class: require('core/Class'),
	Ticker: require('core/Ticker'),
	TagCollection: require('core/TagCollection'),
	EventDispatcher: require('core/EventDispatcher'),
	Loader: require('core/Loader'),
	Preload: require('core/Preload'),
	
	// 渲染组件
	StyleSheet: require('display/StyleSheet'),
	DisplayObject: require('display/DisplayObject'),
	Container: require('display/Container'),
	Canvas: require('display/Canvas'),
	Graphics2D: require('display/Graphics2D'),
	Shape: require('display/Shape'),
	Bitmap: require('display/Bitmap'),
	Text: require('display/Text'),
	
	// 动画组件
	Tween: require('animation/Tween'),
	Movement: require('animation/Movement'),
	Timeline:  require('animation/Timeline'),
	Sprite: require('animation/Sprite'),
	ParticleEmitter: require('animation/ParticleEmitter'),
	ParticleSystem: require('animation/ParticleSystem')

});

base.expand({
	
	setRenderMode: function(mode) {
		if (mode === 'canvas' || mode === 1) {
			this.DisplayObject.prototype.renderMode = 1;
		} else {
			this.DisplayObject.prototype.renderMode = 0;
		}
	}

})

return base;
});