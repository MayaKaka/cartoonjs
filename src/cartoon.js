
define( function ( require, exports, module ) {
	"use strict";
	   
var cartoon = require('base');

cartoon.expand({
	
	// 基础组件
	Class: require('core/Class'),
	Ticker: require('core/Ticker'),
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
	Sprite: require('animation/Sprite'),
	ParticleEmitter: require('animation/ParticleEmitter'),
	ParticleSystem: require('animation/ParticleSystem'),
	Timeline:  require('animation/Timeline'),
	SkeletalAnimation: require('animation/SkeletalAnimation')
	
});

return cartoon;
});