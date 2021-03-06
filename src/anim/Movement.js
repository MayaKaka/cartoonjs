
define(function (require) {
    'use strict';

var Class = require('core/Class'),
    DisplayObject = require('display/DisplayObject'),
    Animation = require('anim/Animation');

var Movement = Animation.extend({
    
    data: null,
    
    _target: null,
    _deltaTime: -1,
    
    init: function(target, data, tick, callback) {
        this._target = target;
        
        this.data = data;
        this._deltaTime = 0;
        this._sx = target.x;
        this._sy = target.y;

        this.update = this[data.type];
        this.tick = tick;
        this.callback = callback;
    },

    finish: function() {
        this.stop();
        this.callback && this.callback();
    },
    
    move: function(delta) {
        var data = this.data,
            target = this._target,
            sx = this._sx,
            sy = this._sy;
        
        var t = this._deltaTime,
            p = data.path[0],
            v = data.v,
            dx = p[0] - sx,
            dy = p[1] - sy,
            dis = Math.sqrt(dx*dx + dy*dy),
            len = v*t,
            x, y;

        if (len > dis) {
            data.path.shift();
            x = p[0];
            y = p[1];
            this._deltaTime = 0;
            this._sx = x;
            this._sy = y;
        } else {
            x = dx/dis*len+sx;
            y = dy/dis*len+sy;
        }

        target.style({ x: x, y: y });
        
        if (!data.path.length || (this.tick && this.tick(t, x, y))) {
            this.finish();
        } else {
            this._deltaTime += delta;
        }
    },

    speed: function(delta) {
        var data = this.data,
            target = this._target,
            sx = this._sx,
            sy = this._sy;
        
        var t = this._deltaTime,
            vx = data.vx,
            vy = data.vy,
            ax = data.ax,
            ay = data.ay,
            dx = ax*t*t/2 + t*vx,
            dy = ay*t*t/2 + t*vy,
            x = sx + dx,
            y = sy + dy;
            
        target.style({ x: x, y: y });
        
        if (this.tick && this.tick(t, x, y)) {
            this.finish();
        } else {
            this._deltaTime += delta;
        }
        
    },
    
    circle: function(delta) {
        var data = this.data,
            target = this._target,
            DEG_TO_RAD = Math.PI/180;
            
        var t = this._deltaTime,
            ox = data.ox,
            oy = data.oy,
            r = data.r,
            scx = data.scx,
            scy = data.scy,
            sdeg = data.sdeg,
            vdeg = data.vdeg;
        
        var deg = sdeg + vdeg*t,
            rad = deg*DEG_TO_RAD,
            x = Math.cos(rad)*r*scx+ox,
            y = Math.sin(rad)*r*scy+oy;
        
        target.style({ x: x, y: y });
        
        if (this.tick && this.tick(t, deg, x, y)) {
            this.finish();
        } else {
            this._deltaTime += delta;
        }
    },
    
    bezier: function(delta) {
        var data = this.data,
            target = this._target;
            
        var p = this._deltaTime / data.duration,
            t = p > 1 ? 1 : p,
            p0 = data.p0,
            p1 = data.p1,
            p2 = data.p2,
            // 二次贝塞尔曲线公式
            x = Math.pow((1-t),2)*p0.x+2*t*(1-t)*p1.x + Math.pow(t,2)*p2.x,
            y = Math.pow((1-t),2)*p0.y+2*t*(1-t)*p1.y + Math.pow(t,2)*p2.y;
            // 三次贝塞尔曲线公式
             // x = Math.pow((1-t),3)*p0.x + 3*p1.x*t*(1-t)*(1-t) + 3*p2.x*t*t*(1-t) + p3.x *Math.pow(t,3),
               // y = Math.pow((1-t),3)*p0.y + 3*p1.y*t*(1-t)*(1-t) + 3*p2.y*t*t*(1-t) + p3.y *Math.pow(t,3);
            
        target.style({ x: x, y: y });
        
        if (this.tick && this.tick(p, x, y)) {
            this.finish();
        } else {
            this._deltaTime += delta;
        }
    }
    
});

Movement._currentTarget = null;
Movement._movements = [];

Movement.update = function(delta) {
    var movements = this._movements;
    // 移除已经完成的动画
    for (var i=movements.length-1; i>=0; i--) {
        if (movements[i]._paused) {
            movements.splice(i, 1);
        }
    }
    // 执行动画
    for (var i=0, l=movements.length; i<l; i++) {
        movements[i].update(delta);
    }
}

Movement.get = function(target) {
    this._currentTarget = target;
    return this;
}

Movement.exec = function(fnName, tick) {
    var target = this._currentTarget;

    switch (fnName) {
        case 'stop':
            target._fxMovement && target._fxMovement.stop();
            target._fxMovement = null;
    }
}

Movement.addMovement = function(data, tick, callback) {
    var movement,
        target = this._currentTarget;
    
    if (typeof(data) === 'string') {
        this.exec(data, tick);
        return;
    }

    if (data.type === 'circle') {
        movement = new Movement(target, {
            type: 'circle',
            ox: data.ox || 0,
            oy: data.oy || 0,
            r: data.r || 0,
            scx: data.scx || 1,
            scy: data.scy || 1,
            sdeg: data.sdeg || 0,
            vdeg: data.vdeg || 0
        }, tick, callback);
    } else if (data.type === 'bezier') {
        movement = new Movement(target, {
            type: 'bezier',
            duration: data.duration || 1000,
            p0: data.p0 || { x: 0, y: 0 },
            p1: data.p1 || { x: 0, y: 0 },
            p2: data.p2 || { x: 0, y: 0 }
        }, tick, callback);
    } else if (data.type === 'speed') {
        movement = new Movement(target, {
            type: 'speed',
            vx: data.vx || 0,
            vy: data.vy || 0,
            ax: data.ax || 0,
            ay: data.ay || 0
        }, tick, callback);
    } else {
        movement = new Movement(target, {
            type: 'move',
            path: data.path || [],
            v: data.v || 0
        }, tick, callback);
    }
    
    movement.play();
    target._fxMovement = movement;
    Movement._movements.push(movement);
}

DisplayObject.prototype.move = function(data, tick, callback) {
    Movement.get(this).addMovement(data, tick, callback);
};

return Movement;
});