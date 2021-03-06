
define(function (require) {
    'use strict';
    
var Class = require('core/Class'),
    DisplayObject = require('display/DisplayObject'),
    Ease = require('anim/Ease'),
    Animation = require('anim/Animation');
    
var Tween = Animation.extend({
    
    from: 0,
    to: 0,
    start: null,
    end: null,
    easing: null,
    
    _target: null,
    _deltaTime: -1,
    
    init: function(target, props, callback, tick) {
        this._target = target;
        this._deltaTime = 0;
        // 设置开始状态和结束状态
        var start = props.start,
            end = props.end;
        // 初始化样式
        if (start) {
            target.style(start);
            start.data && target.data(start.data);
        } else {
            start = {};
            for (var i in end) {
                if (i === 'data') {
                    start[i] = this._clone(target._userData);
                } else {
                    start[i] = this._clone(target.style(i));    
                }
            }
        }
        this.start = start;
        this.end = end;
        // 设置过渡参数
        this.from = props.from;
        this.to = props.to;
        this.easing = Ease.get(props.easing);
        this.callback = callback;
        this.tick = tick;
    },

    finish: function() {
        this.stop();
        this.callback && this.callback();
    },
    
    update: function(delta) {
        if (this._paused) return;
        // 获取过渡参数
        var target = this._target,
            start = this.start,
            end = this.end,
            duration = this.to - this.from,
            easing = this.easing;
        // 计算时间百分比    
        var    now = this._deltaTime,
            percent =  now / duration,
            pos = (percent === 0 || percent === 1 ) ? percent : easing(percent, percent, 0, 1, 1);
        // 设置过渡样式
        for (var i in end) {
            target._stepTween(i, { pos: pos, start: start[i], end: end[i] });
        }
        // 执行每帧完成回调
        if (this.tick) this.tick(percent, pos);
        // 判断动画是否结束
        if (now === duration) {
            // 执行动画完成回调
            this.finish();
        } else {
            // 更新执行时间
            var nextTime = now + delta;
            this._deltaTime = nextTime > duration ? duration : nextTime;
        }
    },
    
    _clone: function(origin) {
        var temp;
        if (typeof(origin) === 'object') {
            temp = {};
            for (var i in origin) {
                temp[i] = this._clone(origin[i]);
            }
         } else {
            temp = origin;
        }
        return temp;
    }
    
});

Tween._tweens = [];
Tween._currentTarget = null;

Tween.destroyAll = function() {
    var tweens = this._tweens,
        target;
    // 销毁执行队列
    for (var i=0, l=tweens.length; i<l; i++) {
        target = tweens[i]._target;
        target._fxQueue = target._fxTween = null;
    }

    this._tweens = [];
}

Tween.update = function(delta) {
    var tweens = this._tweens;
    // 移除已经完成的动画
    for (var i=tweens.length-1; i>=0; i--) {
        if (tweens[i]._paused) {
            tweens.splice(i, 1);
        }
    }
    // 执行动画
    for (var i=0, l=tweens.length; i<l; i++) {
        tweens[i].update(delta);
    }
}

Tween.get = function(target) {
    // 设置当前对象
    this._currentTarget = target;
    return this;
}

Tween.has = function(target) {
    return !!target._fxQueue;
}

Tween.exec = function(fnName, callback) {
    var target = this._currentTarget;
    switch (fnName) {
        case 'shift':
            if (target._fxTween) {
                target._fxTween.stop();
                target._fxTween.callback();
            } else {
                target._fxQueue && target._fxQueue.shift();    
            }
            break;
        case 'pop':
            target._fxQueue && target._fxQueue.pop();
            break;
        case 'stop':
            target._fxTween && target._fxTween.stop();
            target._fxQueue = target._fxTween = null;
            break;
        case 'fadeIn':
            target.style({
                visible: true, alpha: 0
            })
            this.addTween({ alpha: 1 }, null, null, callback);
            break;
        case 'fadeOut':
            target.style({
                visible: true, alpha: 1
            })
            this.addTween({ alpha: 0 }, null, null, function(pos) {
                target.style({ visible: false });
                callback && callback(pos);
            });
            break;
    }
}


Tween.addTween = function(props, duration, easing, callback, tick) {
    var target = this._currentTarget,
        queue = target._fxQueue;
    // 延迟动画，如 obj.to(500, callback)
    if (typeof(props) === 'number') {
        callback = duration;
        duration = props;
        props = {};
        easing = 'none';
    } else if (typeof(props) === 'string') {
        callback = duration;
        this.exec(props, callback);
        return;
    }
    
    var nextAnimation = function() {
        if (callback) callback();
        // 执行下一个动画
        queue = target._fxQueue;
        if (queue && queue.length > 0) {
            queue.shift()();
        } else {
            target._fxQueue = target._fxTween = null;
            target.trigger({ type: 'tweenend' });
        }
    }
    // 创建补间动画
    var doAnimation = function() {
        var tween = new Tween(target, {
            from: 0, to: duration || 300,
            start: null, end: props,
            easing: easing || 'linear'
        }, nextAnimation, tick);
        tween.play();
        target._fxTween = tween;
        Tween._tweens.push(tween);
    };
    
    if (queue) {
        // 添加到动画队列
        queue.push(doAnimation);
    } else {
        // 执行补间动画
        doAnimation();
        target._fxQueue = [];
    }
}



DisplayObject.prototype.to = function(props, duration, easing, callback, tick) {
    // 创建补间动画，参见 jQuery.animate()
    Tween.get(this).addTween(props, duration, easing, callback, tick);
        
    return this;
};

return Tween;
});