
define( function ( require, exports, module ) {
	"use strict";
	
var Class = require('core/Class'),
	Ease = require('animation/Ease');
	
var Tween = Class.extend({
	
	_done: false,

	_target: null,
	_deltaTime: -1,
	
	_start: null,
	_end: null,
	
	_duration: null,
	_easing: null,
	_callback: null,
	_onframe: null,
	
	init: function(target, props) {
		this._target = target;
		this._deltaTime = 0;
		// 设置开始状态和结束状态
		var start = props.start,
			end = props.end;
		if (start) {
			// 初始化样式
			target.style(start);
		} else {
			start = {};
			for (var i in end) {
				start[i] = this._clone(target.style(i));
			}
		}
		this._start = start;
		this._end = end;
		// 设置过渡参数
		this._duration = props.duration;
		this._easing = Ease.get(props.easing);
		this._callback = props.callback;
		this._onframe = props.onframe;
	},
	
	update: function(delta) {
		if (this._done) return;
		// 获取过渡参数
		var target = this._target,
			start = this._start,
			end = this._end,
			duration = this._duration,
			easing = this._easing;
		// 计算时间百分比	
		var	now = this._deltaTime,
			percent =  now / duration,
			pos = easing(percent, percent, 0, 1, 1);
		// 设置过渡样式
		for (var i in end) {
			target._stepStyle(i, {
				pos: pos, start: start[i], end: end[i]
			});
		}
		// 执行每帧完成回调
		if (this._onframe) this._onframe(percent, pos);
		// 判断动画是否结束
		if (now === duration) {
			this._done = true;
			// 执行动画完成回调
			if (this._callback) this._callback();
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

Tween.update = function(delta) {
	var tweens = this._tweens;
	// 移除已经完成的动画
	for (var i=tweens.length-1; i>=0; i--) {
		if (tweens[i]._done) {
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
	return !!target.data('fx_queue');
}

Tween.addTween = function(props, duration, easing, callback, onframe) {
	var target = this._currentTarget,
		queue = target.data('fx_queue');
	// 延迟动画，如 obj.to(500, callback)
	if (typeof(props) === 'number') {
		callback = duration;
		duration = props;
		props = {};
		easing = 'none';
	}
	var nextAnimation = function() {
		if (callback) callback();
		// 执行下一个动画
		queue = target.data('fx_queue');
		if (queue && queue.length > 0) {
			queue.shift()();
		} else {
			target.data('fx_queue', null);
		}
	}
	// 创建补间动画
	var doAnimation = function() {
		var tween = new Tween(target, {
			start: null, end: props,
			duration: duration || 300,
			easing: easing || 'linear',
			callback: nextAnimation,
			onframe: onframe
		});
		Tween._tweens.push(tween);
	};
	
	if (queue) {
		// 添加到动画队列
		queue.push(doAnimation);
	} else {
		// 执行补间动画
		doAnimation();
		target.data('fx_queue', []);
	}
}

return Tween;
});