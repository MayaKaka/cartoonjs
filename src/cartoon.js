
define( function ( require, exports, module ) {
	"use strict";
	   
var cartoon = require('base');

cartoon.expand({
	
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
	Filter: require('display/Filter'),
	Bitmap: require('display/Bitmap'),
	Text: require('display/Text'),
	
	// 动画组件
	Ease: require('animation/Ease'),
	Tween: require('animation/Tween'),
	Movement: require('animation/Movement'),
	Timeline:  require('animation/Timeline'),
	Sprite: require('animation/Sprite'),
	ParticleEmitter: require('animation/ParticleEmitter'),
	ParticleSystem: require('animation/ParticleSystem')

});

cartoon.expand({
	
	create: function(props) {
		props = props || {};
		
		var cls = this[props.type || ''] || this.DisplayObject;

		return cls ? ( cls.create ? cls.create(props) : new cls(props) ) : null;
	},

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