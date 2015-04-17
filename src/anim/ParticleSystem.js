
define(function (require) {
    'use strict';
       
var Animation = require('anim/Animation'),
    ParticleEmitter = require('anim/ParticleEmitter');

var ParticleSystem = Animation.AnimatedObject.extend({
    
    type: 'ParticleSystem',    
    emitter: null,
    particles: null,
    
    _deltaTime: -1,
    
    init: function(props) {
        this._super(props);
        this._initParticle(props.particle || props.p); // 初始化粒子
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
            emitter.init.call(this, particle);
            this.emitter = emitter;
            this.play();
        }
    }
    
});

return ParticleSystem;
});