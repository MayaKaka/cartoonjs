define( function ( require, exports, module ) {
	"use strict";
	
var	base = require('base'),
	Shape = require('display/Shape'),
	Bitmap = require('display/Bitmap'),
	random = base.random;
	   
var ParticleEmitter = function() {};

ParticleEmitter.get = function(type) {
	// 获取粒子效果		
	return ParticleEmitter.particles[type];
}

ParticleEmitter.particles = {	
	rain: {
		type: 'rain',
		init: function(data) {
			var width = data.width,
				height = data.height,
				particle;
			this.particles = [];
			this.data('fall_width', width);
			this.data('fall_height', height);
			// 初始化雨滴粒子
			for(var i=0, l=data.num||60; i<l; i++) {
				particle = new Shape({
					renderMode: this.renderMode,
					x: random(0, width), y: -random(0, height),
					graphics: {
						type: 'rect', width: i%6===0?3:2, height: i%3===0?28:20, fill: '#FFF'
					},
					alpha: random(0, 3)/10+0.2
				});
				
				particle.data('fall_speed', random(0, 25)/100+0.25);
				this.particles.push(particle);
				this.add(particle);
			}
		},
		update: function(delta) {
			var particles = this.particles,
				width = this.data('fall_width'),
				height = this.data('fall_height'),
				particle, dis, y;
			// 雨滴下落效果
			for (var i=0, l=particles.length; i<l; i++) {
				particle = particles[i];
				dis = particle.data('fall_speed')*delta;
				y = particle.y;
				if (y > height) {
					y = -random(0, height);
				}
				particle.style('y', y+dis);
			}
		}
	},
	
	snow: {
		type: 'snow',
		init: function(data) {
			var width = data.width,
				height = data.height,
				image = data.image,
				particle,
				radius, x, y, alpha;

			this.particles = [];
			this.data('fall_width', width);
			this.data('fall_height', height);
			// 初始化雪花粒子
			for (var i=0, l=data.num||60; i<l; i++) {
				x = random(0, width);
				y = -random(0, height);
				radius = random(15, 25);
				alpha = random(6, 10)/10;

				particle = image ? new Bitmap({
					renderMode: this.renderMode,
					x: x, y: y, width: radius, height: radius, scaleToFit: true,
					image: image, alpha: alpha
				}) : new Shape({
					renderMode: this.renderMode,
					x: x, y: y, alpha: random(5, 8)/10,
					graphics: {
						type: 'circle', radius: random(4, 7), fill: '#FFF', angle: 360
					}
				});
				
				particle.data('fall_x', particle.x);
				particle.data('fall_width', random(10, 20));
				particle.data('fall_speed', random(15, 30)/1000);
				this.particles.push(particle);
				this.add(particle);
			}
		},
		update: function(delta) {
			var particles = this.particles,
				width = this.data('fall_width'),
				height = this.data('fall_height'),
				particle, spd, dis, x, y;
			// 雪花飘落效果
			for (var i=0, l=particles.length; i<l; i++) {
				particle = particles[i];
				spd = particle.data('fall_speed');
				dis = spd * delta;
				x = particle.data('fall_x');
				y = particle.y;
				if (y > height) {
					particle.fallTime = 0;
					y = -random(0, height);
				}
				particle.style({ x: x + Math.sin(y / (spd*2000)) * particle.data('fall_width'), y: y + dis });
			}
		}
	},
	
	smoke: {
		type: 'smoke',
		init: function(data) {
			var self = this,
				renderMode = this.renderMode,
				height = data.height,
				startX = 0,
				startY = height,
				image = 'images/smoke.png',
				particles = this.particles = [];
			this.data('spawn_time', 0);
			this.spawn = function() {
				var size = Math.floor(Math.random()*6) + 60;
				var bmp = new Bitmap({
					renderMode: renderMode, x: startX-size/2, y: startY, width: size, height: size,
					image: image, scaleToFit: true, alpha: 0.8
				});
				bmp.data({ 'life_time': 0, 'now_size': 1, 'start_size': 30,
					'vr': (Math.random()*3+3)/10, 'vsize': (Math.random()*3+3)/10,
					'vx': 0, 'vy': - Math.floor(Math.random() * 4 + 20) / 10 });
				bmp.style({ 'transform': { 'rotate': Math.floor(Math.random()*360) } });
				particles.push(bmp);
				self.add(bmp);
			}
		},
		
		update: function(delta) {
			var particles = this.particles,
				spawnTime = this.data('spawn_time'),
				particle, time, size, vx, vy, vr, vsize,
				x, y, ro, alp;
			
			if (spawnTime > 90) {
				this.spawn();
				this.data('spawn_time', 0);
			} else {
				this.data('spawn_time', spawnTime + delta);
			}
				
			for (var i=particles.length-1; i>=0; i--) {
				particle = particles[i];
				time = particle.data('life_time');
				if (time > 6000) {
					particles.splice(i, 1);
					this.remove(particle);
				} else {
					x = particle.x;
					y = particle.y;
					ro = particle.transform.rotate;
					alp = particle.alpha;
					size = particle.width;
					vx = particle.data('vx');
					vy = particle.data('vy');
					vr = particle.data('vr');
					vsize = particle.data('vsize');
					size += vsize;
					particle.data('life_time', time + delta);
					particle.style({ x: x+vx, y: y+vy, size: { width: size, height: size }, transform: { rotate: ro-vr }, alpha: alp-0.0035 });
				}
			}
		}
	},

    fireworks: {
        type: 'fireworks',
        init: function(data) {
            var list = data.list,
                image = data.image,
                num = data.num,
                startX = 0, 
                startY = 0,
                particle;
            this.particles = [];
            for(var i = 0; i < (num || 60); i++) {
                var len = list.length;
                var index = Math.floor(Math.random() * len);
                particle = new Bitmap({ renderMode:this.renderMode, image: image, sourceRect: list[index]});
                var angle = Math.random() * 360 * Math.PI / 180,
                    rotate = Math.random() * 360;
                particle.data('angle', angle);
                var speed = Math.random() * 0.1 + 0.2;
                particle.data('speed', speed);
                particle.style({x: startX, y: startY, transform: { rotate: rotate }});
                this.particles.push(particle);
                this.add(particle);
            }
        },

        update: function(delta) {
            var particles = this.particles,
            	particle, angle, speed,
            	x, y, alpha,
            	dis, dis_x, dis_y;
			
            for(var i = 0, len = particles.length; i < len; i++) {
                particle = particles[i];
                angle = particle.data('angle');
                speed = particle.data('speed');
                x = particle.x;
                y = particle.y;
                alpha = particle.alpha;
                dis = speed * delta;
                dis_x = dis * Math.cos(angle),
                dis_y = dis * Math.sin(angle);
                x += dis_x;
                y += dis_y;
                particle.style({ x: x, y: y, alpha: alpha-0.01 });
            }
            
            if (alpha <= 0) {
            	this.stop();
            	this.trigger({ type: 'animationend' });
            }
        }
    }
	
}

return ParticleEmitter;
});