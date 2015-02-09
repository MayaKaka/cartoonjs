
define(function (require) {
	"use strict";
	   
var DisplayObject = require('display/DisplayObject'),
	ParticleEmitter = require('animation/ParticleEmitter');

var ParticleSystem = DisplayObject.extend({
	
	type: 'ParticleSystem',	
	emitter: null,
	particles: null,
	
	_paused: true,
	
	init: function(props) {
		this._super(props);
		this._initParticle(props.particle || props.p); // 初始化粒子
	},
	
	stop: function() {
		this._paused = true;
	},
	
	update: function(delta) {
		if (this._paused) return;
		// 播放粒子动画
		if (this.emitter) {
			this.emitter.update.call(this, delta);
		}
	},
	
	_initParticle: function(particle) {
		var type = particle.type,
			emitter = type ? ParticleEmitter.get(type) : particle;
		// 初始化粒子
		if (emitter && emitter.init && emitter.update) {
			this._paused = false;
			this.emitter = emitter;
			emitter.init.call(this, particle);
		}
	}
	
});

return ParticleSystem;
});