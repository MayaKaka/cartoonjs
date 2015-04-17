
define(function (require) {
    'use strict';

var base = require('base'),
    Rect = require('shapes/Rect'),
    Circle = require('shapes/Circle'),
    Bitmap = require('display/Bitmap');

var random = base.random;

var ParticleEmitter = function() {};

ParticleEmitter.get = function(type) {
    // 获取粒子效果        
    return ParticleEmitter.particles[type];
};

ParticleEmitter.particles = {    
    rain: {
        init: function(props) {
            var w = props.width || 300,
                h = props.height || 150,
                num = props.num || 60,
                p;

            this.data({ 'width': w, 'height': h });

            for (var i = 0; i < num; i++) {
                p = new Rect({
                    render: this.renderMode,
                    x: random(0, w), y: -random(0, h), alpha: random(0, 3)/10+0.2,
                    width: i%6===0?3:2, height: i%3===0?28:20, fill: '#ffffff'
                });
                p.data('speed', random(0, 250)+250);
                this.add(p);
            }
        },
        update: function(delta) {
            var ps = this.children,
                w = this.data('width'),
                h = this.data('height'),
                p, spd, y;

            for (var i=0, l=ps.length; i<l; i++) {
                p = ps[i];
                spd = p.data('speed');
                y = p.y + spd*delta/1000;

                if (y > h) {
                    y = -random(0, h);
                }
                p.style('y', y);
            }
        }
    },
    
    snow: {
        init: function(props) {
            var w = props.width || 300,
                h = props.height || 150,
                num = props.num || 30,
                rate = props.rate || 1,
                dura = props.duration,
                minS = props.minScale || 0.5,
                maxS = props.maxScale || 1,
                ss = props.spriteSheet || props.ss,
                p, x, y, spd, idx, frame;

            this._deltaTime = 0;
            this.data({ 'width': w, 'height': h, 'duration': dura });

            var newParticle = function(render) {
                x = random(0, w);
                y = -random(0, h);
                if (ss) {
                    idx = random(0, ss.frames.length-1);
                    frame = ss.frames[idx];
                    return new Bitmap({
                        render: render,
                        x: x, y: y, alpha: random(8, 10)/10,
                        image: ss.images[frame[4]], rect: frame,
                        transform: { scale: random(minS*10, maxS*10)/10 }
                    })
                }
                else {
                    return new Circle({
                        render: render,
                        x: x, y: y, alpha: random(6, 8)/10,
                        radius: random(4, 8), fill: '#ffffff'
                    });
                }
            }

            for (var i = 0; i < num; i++) {
                spd = random(25, 50)*rate;
                p = newParticle(this.renderMode);
                p.data({
                    'speedX': spd*random(-6, 6)/10,
                    'speedY': spd,
                    'speedR': random(30, 50)*rate,
                    'defaultA': p.alpha
                });
                this.add(p);
            }
        },
        update: function(delta) {
            var ps = this.children,
                w = this.data('width'),
                h = this.data('height'),
                limit = (h*0.15) > 80 ? 80 : (h*0.15),
                dura = this.data('duration'),
                p, sx, sy, sr, x, y, r;
                
            for (var i=0, l=ps.length; i<l; i++) {
                p = ps[i];
                sx = p.data('speedX');
                sy = p.data('speedY');
                sr = p.data('speedR');
                x = p.x + sx*delta/1000;
                y = p.y + sy*delta/1000;
                r = p.transform.rotate + sr*delta/1000;

                if (y > h || x > w) {
                    if (this._deltaTime > dura) {
                        this.remove(p);
                        i--;
                        l--;
                    } else {
                        x = random(0, w);
                        y = -random(0, h);
                        p.style('alpha', p.data('defaultA'));
                    }
                } else if (y > h-limit) {
                    p.style('alpha', p.alpha-delta/1500);
                }
                p.style({ x: x, y: y, transform: { rotate: r } });
            }

            this._deltaTime += delta;
        }
    },
    
    smoke: {
        init: function(props) {
            var self = this,
                renderMode = this.renderMode,
                height = props.height,
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
        init: function(props) {
            var ss = props.ss,
                sx = 0, sy = 0,
                p, a, r, spd, idx, frame;

            this.particles = [];
            for(var i = 0; i < (props.num || 60); i++) {
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
        init: function(props) {
            var w = props.width || 300,
                h = props.height || 150,
                ss = props.spriteSheet || props.ss,
                vx = props.vx || 0,
                vy = props.vy || 0,
                p, sc, r, v;

            this.particles = [];
            for (var i = 0, l = (props.num || 30); i < l; i++) {
                sc = random(0,10)/10 + 1;
                r = Math.random()*Math.PI*2;
                v = Math.random()*15;
                p = new Circle({
                    renderMode: this.renderMode,
                    x: 0, y: 0, transform: { scale: sc, rotate: random(0, 360) },
                    radius: 3, fill: '#ffdd00'
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

};

return ParticleEmitter;
});