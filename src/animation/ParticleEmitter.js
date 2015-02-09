
define(function (require) {
	"use strict";
  
var ParticleEmitter = function() {};

ParticleEmitter.get = function(type) {
	// 获取粒子效果		
	return ParticleEmitter.particles[type];
};

ParticleEmitter.particles = {};

return ParticleEmitter;
});