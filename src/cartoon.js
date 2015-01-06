
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
	Container: require('display/Container'),
	Canvas: require('display/Canvas'),
	Shape: require('display/Shape'),
	Filter: require('display/Filter'),
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

cartoon.extend({
	
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