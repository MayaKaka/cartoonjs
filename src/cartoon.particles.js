define( function ( require, exports, module ) {
	"use strict";
	
var	cartoon = require('cartoon'),
	Shape = cartoon.Shape,
	Bitmap = cartoon.Bitmap,
	ParticleEmitter = cartoon.ParticleEmitter,
	random = cartoon.random,
	particles = ParticleEmitter.particles;

cartoon.expand(particles, {	
	rain: {
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
		init: function(data) {
			var w = data.width || 300,
				h = data.height || 150,
				img = data.image,
				ss = data.spriteSheet || data.ss,
				p, x, y, spd, idx, frame;

			this.particles = [];
			this.data({ 'fall_width': w, 'fall_height': h });

			var createParticle = function (renderMode, speed) {
				x = random(0, w);
				y = -random(0, h);
				if (ss) {
					idx = random(0, ss.frames.length-1);
					frame = ss.frames[idx];
					return new Bitmap({
						renderMode: renderMode, x: x, y: y, 
						transform: { scale: speed*random(30, 35)/1000 },
						image: ss.images[frame[4]], sourceRect: frame
					})
				} 
				else {
					return new Shape({
						renderMode: renderMode,
						x: x, y: y, alpha: random(5, 9)/10,
						g: { type: 'circle', radius: random(4, 8), fill: '#ffffff' }
					});
				}
			}
			// 初始化雪花粒子
			for (var i=0, l = data.num || 30; i < l; i++) {
				spd = random(25, 50);
				p = createParticle(this.renderMode, spd); 
				p.data({
					'fall_spdx': spd*random(-6, 6)/10, 'fall_spdy': spd, 'fall_spdr': random(30, 50),
					'start_alpha': p.alpha
				});
				this.add(p);
				this.particles.push(p);
			}
		},
		update: function(delta) {
			var particles = this.particles,
				w = this.data('fall_width'),
				h = this.data('fall_height'),
				p, sx, sy, sr, x, y, r;
			// 雪花飘落效果
			for (var i=0, l=particles.length; i<l; i++) {
				p = particles[i];
				sx = p.data('fall_spdx');
				sy = p.data('fall_spdy');
				sr = p.data('fall_spdr');
				x = p.x + sx*delta/1000;
				y = p.y + sy*delta/1000;
				r = p.transform.rotate + sr*delta/1000;
				if (y > h) {
					x = random(0, w);
					y = -random(0, h);
					p.style('alpha', p.data('start_alpha'));
				} else if (y > (h-80)) {
					p.style('alpha', p.alpha-delta/1500);
				}
				p.style({ x: x, y: y, transform: { rotate: r } });
			}
		}
	},
	
	smoke: {
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
        init: function(data) {
            var ss = data.ss,
                sx = 0, sy = 0,
                p, a, r, spd, idx, frame;

            this.particles = [];
            for(var i = 0; i < (data.num || 60); i++) {
                idx = random(0, ss.frames.length-1);
                frame = ss.frames[idx];

                p = new Bitmap({ 
                	renderMode: this.renderMode,
                	image: ss.images[frame[4]], sourceRect: frame
               	});
                a = Math.random() * 360 * Math.PI / 180,
                r = Math.random() * 360;
               
                spd = Math.random() * 0.1 + 0.2;
                p.data({ 'angle': a, 'speed': spd });
                p.style({ x: sx, y: sy, transform: { rotate: r } });
                
                this.add(p);
                this.particles.push(p);
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
    },

    boom: {
    	init: function(data) {
    		var w = data.width || 300,
				h = data.height || 150,
				ss = data.spriteSheet || data.ss,
				vx = data.vx || 0,
				vy = data.vy || 0,
				p, sc, r, v;

			this.particles = [];
    		for (var i = 0, l = (data.num || 30); i < l; i++) {
    			sc = random(0,10)/10 + 1;
    			r = Math.random()*Math.PI*2;
    			v = Math.random()*15;
    			p = new Shape({
					renderMode: this.renderMode,
					x: 0, y: 0, transform: { scale: sc, rotate: random(0, 360) },
					g: { type: 'circle', radius: 3, fill: '#ff0000' }
				});
    			p.data({
    				'vx': Math.cos(r)*v + vx, 'vy': Math.sin(r)*v + vy
    			});

    			this.add(p);
                this.particles.push(p);
			}
    	},

    	update: function(delta) {
    		var particles = this.particles,
    			p, x, y, vx, vy;

			for (var i = 0, l = particles.length; i < l; i++) {
				p = particles[i];
				vx = p.data('vx');
				vy = p.data('vy');
				x = p.x + vx;
				y = p.y + vy;
				vx *= 0.99;
				vy = (vy + 0.5)*0.99;
				p.style({ x: x, y: y });
				p.data({ vx: vx, vy: vy });
				if (p.y > 500 || Math.abs(p.x) > 500) {
					this.remove(p);
					particles.splice(i, 1);
					i--; l--;
				}
			}

			if (l === 0) {
            	this.stop();
            	this.trigger({ type: 'animationend' });
            }
    	}
    }
	
});

return particles;
});