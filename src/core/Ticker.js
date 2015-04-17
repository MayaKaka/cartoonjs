
define(function (require) {
    'use strict';

var Class = require('core/Class'),
    TagCollection = require('core/TagCollection');

var requestFrame = window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        window.msRequestAnimationFrame || window.setTimeout,
        
    cancelFrame = window.cancelAnimationFrame || 
        window.webkitCancelAnimationFrame || 
        window.mozCancelAnimationFrame || 
        window.msCancelAnimationFrame || window.clearTimeout;

var Timer = Class.extend({
    
    fps: -1,
    interval: -1,
    
    _paused: true,
    _timerId: null,
    _targets: null,
    
    init: function(interval) {
        // 初始化循环间隔和帧频
        if (interval) {
            this.interval = interval;
            this.fps = (1000 / interval).toFixed(2);
        } else {
            this.interval = 16.67;
            this.fps = 60;
        }
        // 初始化执行对象集合
        this._targets = [];
    },
    
    alive: function() {
        // 判断是否运行中
        return !this._paused;
    },
    
    start: function() {
        // 启动计时器
        this._clearTimer();
        this._paused = false;
        this._setTimer();
    },
         
    stop: function() {
        // 停止计时器
        this._clearTimer();
        this._paused = true;
    },

    has: function(target) {
        var targets = this._targets;
        // 判断是否存在执行对象
        for (var i=targets.length-1; i>=0; i--) {
            if(targets[i] === target) {
                return true;
            }
        }
        return false;
       },
    
    add: function(target, tag) {
        if (target.update instanceof Function) {
            // 当执行对象为动画实例时，绑定计时器
            if (target._ticker) {
                target._ticker.remove(target);
            }
            target._ticker = this;
        }
        // 添加执行对象
        this._targets.push(target);
        
        if (tag) {
            TagCollection.set(this, 'tick.' + tag, target);
        }
    },
    
    remove: function(target) {
        if (typeof(target) === 'string') {
            target = TagCollection.get(this, 'tick.' + target, true);
        }
        
        var targets = this._targets;
        // 移除执行对象
        for (var i=targets.length-1; i>=0; i--) {
            if(targets[i] === target) {
                targets.splice(i, 1);
                if (target._ticker) {
                    target._ticker = null;
                }
                break;
            }
        }
    },
    
    removeAll: function() {
        var targets = this._targets,
            target;
        // 遍历移除执行对象
        while (targets.length) {
            target = targets.pop();
            if (target._ticker) {
                target._ticker = null;
            }
        }
    },

    wait: function(fn, delay, tag) {
        // 替代原生 setTimeout 功能
        var self = this;
        var deltaTime = 0;

        var target = function(delta) {
            deltaTime += delta;
            if (deltaTime >= delay) {
                fn(deltaTime);
                self.remove(target);
            }
        };

        this.add(target, tag);
    },

    loop: function(fn, delay, tag) {
        // 替代原生 setInterval 功能
        var deltaTime = 0;

        var target = function(delta) {
            deltaTime += delta;
            if (deltaTime >= delay) {
                fn(deltaTime);
                deltaTime = 0;
            }
        };

        this.add(target, tag);
    },

    _clearTimer: function() {
        // 清除原生计时器
        if (this._timerId) {
            cancelFrame(this._timerId);
            this._timerId = null;
        }
    },
    
    _setTimer: function() {
        var self = this,
            interval = self.interval,
            useTimeout = requestFrame === window.setTimeout;
        
        var last, lastAF,
            now, delta,
            delay = (interval - 1) * 0.97,
            times = [], 
            temp, len;

        var getTime = function() {
            return new Date().getTime();
        }

        var hasTick = function() {
            if (useTimeout) return true;
            // 判断是否触发心跳
            if (lastAF) {
                now = getTime();
                if (now - lastAF > delay) {
                    lastAF = now;
                    return true;
                }
            } else {
                lastAF = getTime();
                return true;
            }
            return false;
        };
        

        var tick = function() {
            if (last) {
                now = getTime();
                delta = now - last;
                last = now;
                times.push(delta);
                // 计算执行帧频
                if (times.length >= 10) {
                    times.splice(0, 5);
                    temp = 0;
                    len = times.length;
                    for (var i=0; i<len; i++) {
                        temp += times[i];
                    }
                    self.fps = Math.floor(1000*len/temp);
                }
                // 修正超长延迟误差
                if (delta > interval * 3) {
                    delta = interval * 3;
                }
            } else {
                last = getTime();
                delta = interval;
            }
            // 执行当前帧
            self._execTick(delta);
        };
        
        var nextTick = function() {
            // 判断是否触发心跳
            if (hasTick()) {
                tick(); // 执行当前帧
            }
           
            self._clearTimer();
            // 请求下一帧
            if (!self._paused) {
                // 创建原生计时器
                self._timerId = requestFrame(nextTick, interval); 
            }
        };
            
        nextTick();
    },
     
    _execTick: function(delta) {
        var targets = this._targets, 
            target;
        
        for (var i=0, l=targets.length; i<l; i++) {
            if (this._paused) break;
            // 遍历执行对象
            target = targets[i];
            // 执行心跳函数
            if (target) {
                if (target.update instanceof Function) {
                    target.update(delta);
                } else if (target instanceof Function) {
                     target(delta);
                }
            }
        }
    }
    
});

return new Timer();
});