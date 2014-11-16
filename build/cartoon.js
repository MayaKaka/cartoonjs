
define('base',[],function () {
	
	
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (target) {
		for (var i=0, l=this.length; i<l; i++) {
			if (this[i] === target) {
				return i;
			}
		}
		return -1;
	}
}

if (!Element.prototype.addEventListener) {
	Element.prototype.addEventListener = Element.prototype.attachEvent;
}

var expand = function (props) {
	for (var i in props) {
		this[i] = props[i];
	}
}

return { version: '0.0.0', expand: expand };
});

define('core/Class',[],function(){

// 类式继承基类，参见 http://ejohn.org/blog/simple-javascript-inheritance/
var Class = function() {}, initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

Class.extend = function(props) {
	var superClass = this,
		superProto = this.prototype,
		subClass = function() {
			 if (!initializing && this.init) {
			  	 this.init.apply(this, arguments);
			}
		};
	// 原型链继承	
	if (superClass !== Class) {
		initializing = true;
		subClass.prototype = new superClass();
	}
	initializing = false;
	            
	var subProto = subClass.prototype;
	// 函数重写
	for (var name in props) {
		subProto[name] = (typeof(superProto[name]) === 'function' && 
			typeof(props[name]) === 'function' && fnTest.test(props[name])) ?
			(function(name, fn){
	        	return function() {
	        		var temp = this._super;
	            	this._super = superProto[name];
	           		
	           		var result = fn.apply(this, arguments);  
	           		this._super = temp;
	           		
	           		return result;
	        	};
	        })(name, props[name]) : props[name];
	}
	
	subClass.extend = arguments.callee;
	
	return subClass;
};

return Class;
});

define( 'core/Ticker',['require','exports','module','core/Class'],function ( require, exports, module ) {
	
	   
var Class = require('core/Class');

var requestFrame = window.requestAnimationFrame || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame || 
		window.msRequestAnimationFrame || window.setTimeout,
		
	cancelFrame = window.cancelAnimationFrame || 
		window.webkitCancelAnimationFrame || 
		window.mozCancelAnimationFrame || 
		window.msCancelAnimationFrame || window.clearTimeout;

var Ticker = Class.extend({
	
	fps: -1,
	interval: -1,
	
	_paused: true,
	_timer: null,
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
	    Ticker._tickers.push(this);
	},
	
	isActive: function() {
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
		this._paused = true;
		this._clearTimer();
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
	
	add: function(target) {
		if (target.update instanceof Function) {
			// 当执行对象为动画实例时，绑定计时器
			if (target._ticker) {
				target._ticker.remove(target);
			}
			target._ticker = this;
		}
		// 添加执行对象
        this._targets.push(target);
	},
    
    remove: function(target) {
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

	_clearTimer: function() {
		// 清除原生计时器
		if (this._timer) {
			cancelFrame(this._timer);
	    	this._timer = null;
	    }
	},
	
	_setTimer: function() {
		var self = this,
			interval = self.interval,
			useTimeout = requestFrame === window.setTimeout;
		
		var last = 0, lastAF = 0,
			now = 0, delta = 0,
			delay = (interval-1) * 0.97,
	        times = [], 
	        temp, len;

	    var hasTick = function() {
	        if (useTimeout) return true;
			// 判断是否触发心跳
	        if (lastAF === 0) {
	        	lastAF = new Date().getTime();
	        	return true;
	        } else {
	        	now = new Date().getTime();
	        	if (now-lastAF > delay) {
	        		lastAF = now;
	        		return true;
	        	}
	        }
	        return false;
		};
	        
	    var tick = function() {
			if (last === 0) {
		    	last = new Date().getTime();
		    } else {
				now = new Date().getTime();
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
		        	delta = interval; 
		        }
			}
		    // 执行当前帧
		    self._exec(delta);
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
	        	self._timer = requestFrame(nextTick, interval); 
	        }
		};
	        
	    nextTick();
    },
     
   	_exec: function(delta) {
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

Ticker._tickers = [];
Ticker.destroyAll = function() {
	var tickers = this._tickers,
		ticker;
	// 销毁所有计时器
	for (var i=0, l=tickers.length; i<l; i++) {
		ticker = tickers[i];
		if (ticker.isActive()) {
			ticker.stop();
		}
	}
}

return Ticker;
});

define( 'core/EventDispatcher',['require','exports','module','core/Class'],function ( require, exports, module ) {
	
	 
var Class = require('core/Class');

// 事件派发器，参见 https://github.com/mrdoob/eventdispatcher.js
var EventDispatcher = Class.extend({
	
	_listeners: null,
	
	on: function(type, listener, tag) {
		// 绑定事件
		this.addEventListener(type, listener);
		// 添加监听器标签
		if (typeof(tag) === 'string') {
			this._listeners['@' + type + '.' + tag] = [ listener ];
		}
	},
	
	off: function(type, tag) {
		// 解绑事件
		var listener;
		// 通过标签查找监听器
		if (typeof(tag) === 'string') {
			tag = '@' + type + '.' + tag;
			listener = this._listeners[tag][0];
			this._listeners[tag] = null;
		} else {
			listener = tag;
		}
		
		this.removeEventListener(type, listener);
	},
	
	trigger: function(evt) {
		// 触发事件
		this.dispatchEvent(evt);
	},
	
	addEventListener: function(type, listener) {
		if (!this._listeners) this._listeners = {};

		var listeners = this._listeners,
			listenerArray = listeners[type];
			
		if (!listenerArray) {
			listenerArray = listeners[type] = [];
		}	
		// 添加事件函数
		if (listenerArray.indexOf(listener) === - 1) {
			listenerArray.push(listener);
		}
	},

	hasEventListener: function(type, listener) {
		if (!this._listeners) return false;

		var listeners = this._listeners,
			listenerArray = listeners[type];
		// 检测事件函数
		if (listenerArray) {
			if (listener) {
				return listenerArray.indexOf(listener) !== - 1;
			}
			return listenerArray.length > 0;
		}

		return false;
	},

	removeEventListener: function(type, listener) {
		if (!this._listeners) return;

		var listeners = this._listeners,
			listenerArray = listeners[type];

		if (listenerArray) {
			if (listener) {
				var index = listenerArray.indexOf(listener);
				// 移除事件函数
				if (index !== - 1) {
					listenerArray.splice(index, 1);
				}	
			} else if (istenerArray.length > 0) {				 
				listeners[type] = [];
			}
		}
	},

	dispatchEvent: function(evt) {
		if (!this._listeners) return;

		var listeners = this._listeners,
			listenerArray = listeners[evt.type];

		if (listenerArray) {
			evt.target = this;
			// 遍历执行事件函数
			for (var i=0, l=listenerArray.length; i<l; i++) {
				listenerArray[i].call(this, evt);
			}
		}
	}
	
});

return EventDispatcher;
});

define( 'core/Loader',['require','exports','module','core/EventDispatcher'],function ( require, exports, module ) {
	

var EventDispatcher = require('core/EventDispatcher');

var Loader = EventDispatcher.extend({
	
	regexpImage: /\.jpg$|\.png$|\.gif$/,
	regexpJson: /\.json$/,
	
	_resources: null,
	_loadQueue: null,
	_loadQueueLength: -1,	

	init: function() {
		this._resources = {};
		this._loadQueue = [];
	},
	
	load: function(manifest) {
		var len = this._loadQueueLength
				= manifest.length,
			url, type;
		for (var i=0; i<len; i++) {
			url = manifest[i];
			if (this.regexpImage.test(url)) {
				type = 'image';
			} else if (this.regexpJson.test(url)) {
				type = 'json';
			} else {
				type = 'text';
			}
			this._loadQueue.push({ type: type, url: url });
		}
		
		if (len) {
			this._loadNext();	
		}
	},
	
	loadFile: function(res) {
		if (res.type === 'image') {
			this._loadImage(res);
		} else {
			this._loadJson(res);
		}
	},
	
	hasItem: function(url) {
		return url in this._resources;
	},
	
	getItem: function(url) {
		return this._resources[url];
	},
	
	setItem: function(url, file) {
		this._resources[url] = file;		
	},
	
	_loadComplete: function(file) {
		var progress = 1;
		
		if (this._loadQueueLength) {
			progress = 1 - this._loadQueue.length / this._loadQueueLength;		
			this.trigger({
				type: 'progress', progress: progress, file: file
			})
		}	
		
		if (progress < 1) {
			this._loadNext();
		} else {
			this._loadQueueLength = 0;
			this.trigger({ type: 'complete', file: file });
		}
	},
	
	_loadNext: function() {
		this.loadFile(this._loadQueue.shift());
	},
	
	_loadImage: function(res) {
		var self = this,
			image = new Image();
		
		image.src = res.url;
		image.onload = function(){
			self._loadComplete(image);
		};
		
		this.setItem(res.url, image);
	},
	
	_loadJson: function(res) {
		var self = this, json, text,
			xhr = new XMLHttpRequest();
			
		xhr.onreadystatechange = function () {
			if (xhr.readyState === xhr.DONE) {
				if (xhr.status === 200 || xhr.status === 0) {
					text = xhr.responseText;
					if (text) {
						json = res.type === 'json' ? JSON.parse(text) : text;
						self.setItem(res.url, json);
						self._loadComplete(json);
					}
				}
			}
		};
	
		xhr.open('GET', res.url, true);
		xhr.send(null);
	}

});

return Loader;
});

define( 'core/Preload',['require','exports','module','core/Loader'],function ( require, exports, module ) {
	

var Loader = require('core/Loader');

return new Loader();
});

define( 'display/StyleSheet',['require','exports','module','core/Preload'],function ( require, exports, module ) {

var Preload = require('core/Preload');

var divStyle = document.createElement('div').style,
	prefix = divStyle.webkitTransform === ''? 'webkit' :
    		 divStyle.WebkitTransform === ''? 'Webkit' :
    		 divStyle.msTransform === ''? 'ms' :
    		 divStyle.MozTransform === ''? 'Moz' : 'ct',
    isIE9 = navigator.userAgent.indexOf("MSIE 9.0") > 0,
    supportIE6Filter = prefix === 'ct' && divStyle.filter === '',
    regexpColor = /^\#|^rgb|^rgba|black|red|green|blue|yellow|orange|pink|purple|gray/,
	regexpGradient = /^top|^right|^bottom|^left|^center/,
	regexpImage = /\.jpg$|\.png$|\.gif$/;
    
var StyleSheet = function() {};

StyleSheet.has = function(key) {
	// 判断是否存在样式
	return !!StyleSheet.styles[key];
}

StyleSheet.init = function(target, key) {
	var style = StyleSheet.styles[key];
	// 初始化样式
	if (style && style.init) {
		return style.init.call(target, key);
	}
}

StyleSheet.get = function(target, key) {
	var style = StyleSheet.styles[key];
	// 获取样式
	if (style) {
		return style.get.call(target, key);
	}
}

StyleSheet.set = function(target, key, value) {
	var style = StyleSheet.styles[key];
	// 设置样式
	if (style) {
		style.set.call(target, key, value);
	}
}

StyleSheet.step = function(target, key, value) {
	var style = StyleSheet.styles[key];
	// 设置过渡样式
	if (style && style.step) {
		style.step.call(target, key, value);
	}
}

StyleSheet.css3 = function(style, key, value) {
	// 通用设置css3样式
	var suffix = key.charAt(0).toUpperCase() + key.substring(1, key.length);
	style[prefix+suffix] = value;
};

StyleSheet.commonGet = function(key) {
	// 通用获取样式
	return this[key];
};

StyleSheet.commonSet = function(key, value) {
	// 通用设置样式
	this[key] = value;
};

StyleSheet.commonStep = function(key, fx) {
	// 通用设置过渡样式
	var start = fx.start,
		end = fx.end,
		pos = fx.pos;	
	var result = (end - start) * pos + start;
	this.style(key, result);
};

StyleSheet.commonSteps = function(key, fx) {
	// 通用设置过渡样式
	var pos = fx.pos,
		start = fx.start,
		end = fx.end;
	var result = {};
	for (var i in end) {
		result[i] = (end[i] - start[i]) * pos + start[i];
	}
	this.style(key, result);
};

StyleSheet.toRGBA = function(color){
	var rgba = {
		r: 0, g: 0, b: 0, a: 1
	};
	// 将色值转换成rgba格式	
	if (color.indexOf('rgb') > -1) {
		color = color.replace(/rgb\(|rgba\(|\)/g, '');
		color = color.split(',');
		rgba.r = parseInt(color[0]);
		rgba.g = parseInt(color[1]);
		rgba.b = parseInt(color[2]);
		if (color.length === 4) {
			rgba.a = color[3];
		}
	} else if(color.indexOf('#') > -1) {
		if (color.length === 4) {
			rgba.r = color.substring(1,2);
			rgba.g = color.substring(2,3);
			rgba.b = color.substring(3,4);
			rgba.r = parseInt(rgba.r+rgba.r, 16);
			rgba.g = parseInt(rgba.g+rgba.g, 16);
			rgba.b = parseInt(rgba.b+rgba.b, 16);
		} else {
			rgba.r = parseInt(color.substring(1,3), 16);
			rgba.g = parseInt(color.substring(3,5), 16);
			rgba.b = parseInt(color.substring(5,7), 16);
		}
	}
	
	return rgba;
};

StyleSheet.toColor = function(rgba) {
	var r = rgba.r.toString(16),
		g = rgba.g.toString(16),
		b = rgba.b.toString(16);
	// 将色值转换成16进制格式
	if (r.length===1) r = '0'+r;
	if (g.length===1) g = '0'+g;
	if (b.length===1) b = '0'+b;
	return '#'+r+g+b;
};

StyleSheet.toGradient = function(gradient) {
	if (typeof(gradient) === 'string') {
		gradient = gradient.split(/\,#|\,rgb/);
		// 将渐变样式转换成数组格式
		for (var i=1,l=gradient.length; i<l; i++) {
			gradient[i] = (gradient[i].indexOf('(')>-1?'rgb':'#') + gradient[i];
		}
	}
	return gradient;
};

StyleSheet.stepColor = function(pos, start, end) {
	start = StyleSheet.toRGBA(start);
	end = StyleSheet.toRGBA(end);
	// 处理颜色过渡
	var color = {};
	for (var i in end) {
		color[i] = Math.floor((end[i] - start[i]) * pos + start[i]);
	}
	return StyleSheet.toColor(color);
}

StyleSheet.styles = {
	x: { // x轴坐标
		get: StyleSheet.commonGet,
		set: function(key, value) {
			this[key] = value;
			if (this.renderMode === 0) {
				var style = this.elemStyle;
				style.position = 'absolute';
				style.left = value + 'px';
			}
		},
		step: StyleSheet.commonStep
	},
	
	y: { // y轴坐标
		get: StyleSheet.commonGet,
		set: function(key, value) {
			this[key] = value;
			if (this.renderMode === 0) {
				var style = this.elemStyle;
				style.position = 'absolute';
				style.top = value + 'px';
			}
		},
		step: StyleSheet.commonStep
	},
	
	z: { // 3d远视坐标
		get: StyleSheet.commonGet,
		set: function(key, value) {
			this[key] = value;
			this.style('transform3d', { perspective: value });
		},
		step: StyleSheet.commonStep
	},
	
	pos: { // xy坐标
		get: function(key) {
			return { x: this.x, y: this.y };
		},
		set: function(key, value) {
			if (value.x !== undefined) this.x = value.x;
			if (value.y !== undefined) this.y = value.y;
			if (this.renderMode === 0) {
				var style = this.elemStyle;
				style.position = 'absolute';
				style.left = this.x + 'px';
				style.top = this.y + 'px';
			}
		},
		step: StyleSheet.commonSteps
	},
	
	width: { // 宽度
		get: StyleSheet.commonGet,
		set: function(key, value) {
			this[key] = value;
			if (this.renderMode === 0) {
				if (this.useElemSize) {
					this.elem.width = value;
				} else {
					this.elemStyle.width = value + 'px';
				}
			}
		},
		step: StyleSheet.commonStep
	},
	
	height: { // 高度
		get: StyleSheet.commonGet,
		set: function(key, value) {
			this[key] = value;
			if (this.renderMode === 0) {
				if (this.useElemSize) {
					this.elem.height = value;
				} else {
					this.elemStyle.height = value + 'px';
				}
			}
		},
		step: StyleSheet.commonStep
	},
	
	size: { // 尺寸
		get: function(key) {
			return { width: this.width, height: this.height };
		},
		set: function(key, value) {
			if (value.width !== undefined) this.width = value.width;
			if (value.height !== undefined) this.height = value.height;
			if (this.renderMode === 0) {
				if (this.useElemSize) {
					var elem = this.elem;
					elem.width = this.width;
					elem.height = this.height;
				} else {
					var style = this.elemStyle;
					style.width = this.width + 'px';
					style.height = this.height + 'px';
				}
			}		
		},
		step: StyleSheet.commonSteps
	},
	
	transform: { // 2d变换
		init: function(key) {
			this.transform = {
				translateX: 0, translateY: 0,
				rotate: 0, scale: 1,
				scaleX: 1, scaleY: 1,
				skewX: 0, skewY: 0,
				originX: 0.5, originY: 0.5
			};
			return this.transform;
		},
		get: function(key) {
			return this.transform || StyleSheet.init(this, key);
		},
		set: function(key, value) {
			var t2d = StyleSheet.get(this, key);
			for (var i in value) {
				this._updateTransform(i, value[i]);
			}
			if (this.renderMode === 0) {
				var style = this.elemStyle;
				if (supportIE6Filter) {
					// ie6-8下使用matrix filter
					var	elem = this.elem,
						filter = style.filter,
						regexp = /Matrix([^)]*)/,
						mtx = this._updateMatrix2D(true),
						text = [
							'Matrix('+'M11='+mtx.a,
							'M12='+mtx.b, 'M21='+mtx.c, 'M22='+mtx.d,
							'SizingMethod=\'auto expand\''
						].join(',');
					style.filter = regexp.test(filter) ? filter.replace(regexp, text) : ('progid:DXImageTransform.Microsoft.' + text + ') ' + filter);		
					style.marginLeft = t2d.translateX + (elem.clientWidth - elem.offsetWidth) * t2d.originX + 'px';
					style.marginTop = t2d.translateY + (elem.clientHeight - elem.offsetHeight) * t2d.originY + 'px';
				} else {
					// 设置css3样式
					StyleSheet.css3(style, 'transform', this._mergeTransformText());
					if ('originX' in value || 'originY' in value) {
						StyleSheet.css3(style, 'transformOrigin', t2d.originX*100+'% ' + t2d.originY*100+'%');
					}
				}
			}
		},
		step: StyleSheet.commonSteps
	},
	
	transform3d: { // 3d变换
		init: function(key) {
			this.transform3d = {
				perspective: 0,
				translateX: 0, translateY: 0, translateZ: 0,
				rotateX: 0, rotateY: 0, rotateZ: 0,
				scaleX: 1, scaleY: 1, scaleZ: 1,
				originX: 0.5, originY: 0.5, originZ: 0.5 
			};
			if (this.renderMode === 0) {
				var style = this.elemStyle;
				StyleSheet.css3(style, 'transformStyle', 'preserve-3d');
				StyleSheet.css3(style, 'backfaceVisibility', 'visible');
			}
			return this.transform3d;
		},
		get: function(key){
			return this.transform3d || StyleSheet.init(this, key);
		},
		set: function(key, value) {
			var t3d = StyleSheet.get(this, key);
			for (var i in value) {
				this._updateTransform3D(i, value[i]);
			}
			if (this.renderMode === 0) {
				// 设置css3样式
				var style = this.elemStyle;
				StyleSheet.css3(style, 'transform', this._mergeTransform3DText());
				if ('originX' in value || 'originY' in value || 'originZ' in value) {
					StyleSheet.css3(style, 'transformOrigin', t3d.originX*100+'% ' + t3d.originY*100+'%');
				}
			};
		},
		step: StyleSheet.commonSteps
	},
	
	visible: { // 是否可见
		get: StyleSheet.commonGet,
		set: function(key, value) {
			this[key] = value;		
			if (this.renderMode === 0) {
				this.elemStyle.display = value ? 'block' : 'none';
			}
		}
	},
		
	overflow: { // 溢出效果
		get: StyleSheet.commonGet,
		set: function(key, value) {
			this[key] = value;
			if (this.renderMode === 0) {
				this.elemStyle.overflow = value;
			}
		}
	},
	
	alpha: { // 透明度
		get: StyleSheet.commonGet,
		set: function(key, value) {
			value = value >= 0 ? value : 0;
			this[key] = value;
			if (this.renderMode === 0) {
				var style = this.elemStyle;
				if (supportIE6Filter) {
					// ie6-8下使用alpha filter
					var filter = style.filter,
						regexp = /alpha\(opacity=([^)]*)/,
						text = 'alpha(opacity=' + value*100;
					style.filter = regexp.test(filter) ? filter.replace(regexp, text) : (filter + ' '+ text + ')');	
				} else {
					// 设置css3样式
					style.opacity = value;
				}
			}
		},
		step: StyleSheet.commonStep
	},
	
	shadow: { // 阴影
		get: StyleSheet.commonGet,
		set: function(key, value) {
			if (typeof(value) === 'string') {
				value = value.split('px ');
				value = {
					offsetX: parseFloat(value[0]),
					offsetY: parseFloat(value[1]),
					blur: parseFloat(value[2]),
					color: value[3]
				}
			}
			this[key] = value;
			if (this.renderMode === 0) {
				this.elemStyle.boxShadow = value.offsetX+'px ' + value.offsetY+'px ' + value.blur+'px ' + value.color;
			}
		},
		step: StyleSheet.commonSteps
	},
	
	fill: { // 填充样式
		get: function(key) {
			return this.fillColor || this.fillGradient || this.fillImage;
		},
		set: function(key, value) {
			if (regexpColor.test(value)) {		
				this.style('fillColor', value);
			} else if (regexpGradient.test(value)) {
				this.style('fillGradient', value);
			} else if (regexpImage.test(value)) { 
				this.style('fillImage', value);
			}
		},
		step: function(key, fx) {
			var value = fx.end;
			if (regexpColor.test(value)) {		
				this._stepStyle('fillColor', fx);
			} else if (regexpGradient.test(value)) {
				this._stepStyle('fillGradient', fx);
			}
		}
	},
	
	fillColor: { // 填充色
		get: StyleSheet.commonGet,
		set: function(key, value) {
			this.fillGradient = this.fillImage = null;
			this[key] = value;
			if (this.renderMode === 0) {
				this.elemStyle.backgroundColor = value;
				this.elemStyle.backgroundImage = '';
			}
		},
		step: function(key, fx) {
			this.style(key, StyleSheet.stepColor(fx.pos, fx.start, fx.end));
		}
	},	
	
	fillGradient: { // 填充渐变
		get: StyleSheet.commonGet,
		set: function(key, value) {
			this.fillColor = this.fillImage = null;
			this[key] = value = StyleSheet.toGradient(value);
			if (this.renderMode === 0) {
				var style = this.elemStyle, text;
				if (supportIE6Filter || isIE9) {
					// ie6-8下使用gradient filter
					var filter = style.filter,
						regexp = /gradient([^)]*)/;
					text = 'gradient(GradientType=0,startColorstr=\''+value[1]+'\', endColorstr=\''+value[2]+'\'';
					style.filter = regexp.test(filter) ? filter.replace(regexp, text) : (filter + ' progid:DXImageTransform.Microsoft.'+text+')');
				} else {
					// 设置css3样式
					if (value[0]==='center') {
						text = 'radial-gradient(circle,'+value[1]+','+value[2]+')';
					} else {
						text = 'linear-gradient('+value[0]+','+value[1]+','+value[2]+')';
					}
					style.backgroundImage = '-webkit-' + text;
					style.backgroundImage = '-ms-' + text;
					style.backgroundImage = '-moz-' + text;
				}
			}
		}, 
		step: function(key, fx) {
			var start = fx.start,
				end = fx.end,
				end = StyleSheet.toGradient(end),
				pos = fx.pos,
				result = [end[0]];
			// 设置渐变颜色过渡
			result.push(StyleSheet.stepColor(pos, start[1], end[1]));
			result.push(StyleSheet.stepColor(pos, start[2], end[2]));
			this.style(key, result);
		}
	},
	
	fillImage: { // 填充位图
		get: StyleSheet.commonGet,
		set: function(key, value) {
			this.fillColor = this.fillGradient = null;
			if (this.renderMode === 0) {
				this.elemStyle.backgroundImage = 'url(' + value + ')';
			} else {
				if (!Preload.hasItem(value)) { // 初始化image
					Preload.loadFile({ type: 'image', url: value });
				}
				value = Preload.getItem(value);
			}
			this[key] = value;
		}
	},
	
	stroke: { // 画笔样式
		get: function(key) {
			return this.strokeColor;
		},
		set: function(key, value) {
			this.style('strokeColor', value);
		},
		step: function(key, fx) {
			this._stepStyle('strokeColor', fx);
		}
	},
	
	strokeColor: { // 画笔颜色
		get: StyleSheet.commonGet,
		set: function(key, value) {
			this[key] = value;
			if (this.renderMode === 0) {
				var style = this.elemStyle;	
				style.borderColor = value;
				style.borderStyle = 'solid';
			}
		},
		step: function(key, fx) {
			this.style(key, StyleSheet.stepColor(fx.pos, fx.start, fx.end));
		}
	},
	
	lineWidth: { // 画笔宽度
		get: StyleSheet.commonGet,
		set: function(key, value) {
			this[key] = value;
			if (this.renderMode === 0) {
				this.elemStyle.borderWidth = value + 'px';
			}
		},
		step: StyleSheet.commonStep
	},
	
	radius: { // 圆半径
		get: StyleSheet.commonGet,
		set: function(key, value) {
			this[key] = value;
			this.width = this.height = value * 2;
			if (this.renderMode === 0) {
				var style = this.elemStyle;
				style.borderRadius = '50%';
				style.width = style.height = this.width + 'px';
			}
		},
		step: StyleSheet.commonStep
	},
	
	angle: { // 圆角度
		get: StyleSheet.commonGet,
		set: StyleSheet.commonSet,
		step: StyleSheet.commonStep
	},
	
	radiusXY: { // 椭圆半径
		get: function(key) {
			return { radiusX: this.radiusX, radiusY: this.radiusY };
		},
		set: function(key, value) {
			if (value.radiusX !== undefined) {
				this.radiusX = value.radiusX;
				this.width = this.radiusX * 2;
			}
			if (value.radiusY !== undefined) {
				this.radiusY = value.radiusY;
				this.height = this.radiusY * 2;
			}
			if (this.renderMode === 0) {
				var style = this.elemStyle;
				style.borderRadius = '50%';
				style.width = this.width + 'px';
				style.height = this.height + 'px';
			}
		},
		step: StyleSheet.commonSteps
	},
	
	font: { // 字体
		get: StyleSheet.commonGet,
		set: StyleSheet.commonSet,
		step: StyleSheet.commonStep
	},

	textColor: { // 文字颜色
		get: StyleSheet.commonGet,
		set: StyleSheet.commonSet,
		step: StyleSheet.commonStep
	}
	
}

return StyleSheet;
});

define( 'core/UserData',['require','exports','module','core/Class'],function ( require, exports, module ) {
	
	  
var Class = require('core/Class');

var UserData = Class.extend({
	
	_data: null,
	
	init: function() {
		// 初始化私有数据
		this._data = {};
	},
	
	get: function(key) {
		return this._data[key];
	},
	
	set: function(key, value) {
		this._data[key] = value;
		return value;
	}
	
});

return UserData;
});

define( 'core/Matrix2D',['require','exports','module','core/Class'],function ( require, exports, module ) {
	
	
var Class = require('core/Class');

var DEG_TO_RAD = Math.PI/180;

// 2D矩阵，参见 https://github.com/CreateJS/EaselJS/blob/master/src/easeljs/geom/Matrix2D.js
var Matrix2D = Class.extend({
	
	a: 1,
	b: 0,
	c: 0,
	d: 1,
	tx: 0,
	ty: 0,
	
	prepend: function(a, b, c, d, tx, ty) {
		var tx1 = this.tx;
		if (a != 1 || b != 0 || c != 0 || d != 1) {
			var a1 = this.a;
			var c1 = this.c;
			this.a  = a1*a+this.b*c;
			this.b  = a1*b+this.b*d;
			this.c  = c1*a+this.d*c;
			this.d  = c1*b+this.d*d;
		}
		this.tx = tx1*a+this.ty*c+tx;
		this.ty = tx1*b+this.ty*d+ty;
		return this;
	},
	
	append: function(a, b, c, d, tx, ty) {
		var a1 = this.a;
		var b1 = this.b;
		var c1 = this.c;
		var d1 = this.d;

		this.a  = a*a1+b*c1;
		this.b  = a*b1+b*d1;
		this.c  = c*a1+d*c1;
		this.d  = c*b1+d*d1;
		this.tx = tx*a1+ty*c1+this.tx;
		this.ty = tx*b1+ty*d1+this.ty;
		return this;
	},
	
	prependMatrix: function(matrix) {
		this.prepend(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
		return this;
	},
	
	appendMatrix: function(matrix) {
		this.append(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
		return this;
	},
	
	prependTransform: function(x, y, scaleX, scaleY, rotation, skewX, skewY) {
		if (rotation%360) {
			var r = rotation*DEG_TO_RAD;
			var cos = Math.cos(r);
			var sin = Math.sin(r);
		} else {
			cos = 1;
			sin = 0;
		}

		if (skewX || skewY) {
			// TODO: can this be combined into a single prepend operation?
			skewX *= DEG_TO_RAD;
			skewY *= DEG_TO_RAD;
			this.prepend(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, 0, 0);
			this.prepend(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
		} else {
			this.prepend(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, x, y);
		}
		return this;
	},
	
	appendTransform: function(x, y, scaleX, scaleY, rotation, skewX, skewY) {
		if (rotation%360) {
			var r = rotation*DEG_TO_RAD;
			var cos = Math.cos(r);
			var sin = Math.sin(r);
		} else {
			cos = 1;
			sin = 0;
		}

		if (skewX || skewY) {
			// TODO: can this be combined into a single append?
			skewX *= DEG_TO_RAD;
			skewY *= DEG_TO_RAD;
			this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
			this.append(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, 0, 0);
		} else {
			this.append(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, x, y);
		}
		return this;
	},
	
	rotate: function(angle) {
		var cos = Math.cos(angle);
		var sin = Math.sin(angle);

		var a1 = this.a;
		var c1 = this.c;
		var tx1 = this.tx;

		this.a = a1*cos-this.b*sin;
		this.b = a1*sin+this.b*cos;
		this.c = c1*cos-this.d*sin;
		this.d = c1*sin+this.d*cos;
		this.tx = tx1*cos-this.ty*sin;
		this.ty = tx1*sin+this.ty*cos;
		return this;
	},
	
	skew: function(skewX, skewY) {
		skewX = skewX*DEG_TO_RAD;
		skewY = skewY*DEG_TO_RAD;
		this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), 0, 0);
		return this;
	},
	
	scale: function(x, y) {
		this.a *= x;
		this.d *= y;
		this.c *= x;
		this.b *= y;
		this.tx *= x;
		this.ty *= y;
		return this;
	},
	
	translate: function(x, y) {
		this.tx += x;
		this.ty += y;
		return this;
	},
	
	identity: function() {
		this.a = this.d = 1;
		this.b = this.c = this.tx = this.ty = 0;
		return this;
	},
	
	invert: function() {
		var a1 = this.a;
		var b1 = this.b;
		var c1 = this.c;
		var d1 = this.d;
		var tx1 = this.tx;
		var n = a1*d1-b1*c1;

		this.a = d1/n;
		this.b = -b1/n;
		this.c = -c1/n;
		this.d = a1/n;
		this.tx = (c1*this.ty-d1*tx1)/n;
		this.ty = -(a1*this.ty-b1*tx1)/n;
		return this;
	},
	
	isIdentity: function() {
		return this.tx == 0 && this.ty == 0 && this.a == 1 && this.b == 0 && this.c == 0 && this.d == 1;
	},
	
	transformPoint: function(x, y, pt) {
		pt = pt||{};
		pt.x = x*this.a+y*this.c+this.tx;
		pt.y = x*this.b+y*this.d+this.ty;
		return pt;
	}
	
});

return Matrix2D;
});

define( 'animation/Ease',['require','exports','module'],function ( require, exports, module ) {
	
	
var Ease = function() {};

Ease.get = function(type) {
	// 获取过渡函数
	return easing[type] || easing.linear;
};

// 过渡函数，参见 https://github.com/gdsmith/jquery.easing
// t: current time, b: begInnIng value, c: change In value, d: duration
var easing = {
	none: function( p ) {
		if (p >= 1) return 1;
		return 0;
	},
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	},
	
	easeIn: function (x, t, b, c, d) {
		return easing.easeInQuad(x, t, b, c, d);
	},
	easeOut: function (x, t, b, c, d) {
		return easing.easeOutQuad(x, t, b, c, d);
	},
	easeInOut: function (x, t, b, c, d) {
		return easing.easeInOutQuad(x, t, b, c, d);
	},
	expoIn: function(x, t, b, c, d) {
		return easing.easeInExpo(x, t, b, c, d);
	},
	expoOut: function(x, t, b, c, d) {
		return easing.easeOutExpo(x, t, b, c, d);
	},
	expoInOut: function(x, t, b, c, d) {
		return easing.easeInOutExpo(x, t, b, c, d);
	},
	bounceIn: function(x, t, b, c, d) {
		return easing.easeInBounce(x, t, b, c, d);
	},
	bounceOut: function(x, t, b, c, d) {
		return easing.easeOutBounce(x, t, b, c, d);
	},
	bounceInOut: function(x, t, b, c, d) {
		return easing.easeInOutBounce(x, t, b, c, d);
	},
	elasIn: function(x, t, b, c, d) {
		return easing.easeInElastic(x, t, b, c, d);
	},
	elasOut: function(x, t, b, c, d) {
		return easing.easeOutElastic(x, t, b, c, d);
	},
	elasInOut: function(x, t, b, c, d) {
		return easing.easeInOutElastic(x, t, b, c, d);
	},
	backIn: function(x, t, b, c, d) {
		return easing.easeInBack(x, t, b, c, d);
	},
	backOut: function(x, t, b, c, d) {
		return easing.easeOutBack(x, t, b, c, d);
	},
	backInOut: function(x, t, b, c, d) {
		return easing.easeInOutBack(x, t, b, c, d);
	}
};

Ease.easing = easing;
// 绑定jQuery
if (jQuery) {
	jQuery.extend(jQuery.easing, easing);
}

return Ease;
});

define( 'animation/Tween',['require','exports','module','core/Class','animation/Ease'],function ( require, exports, module ) {
	
	
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

define( 'display/DisplayObject',['require','exports','module','core/EventDispatcher','core/UserData','core/Matrix2D','display/StyleSheet','animation/Tween'],function ( require, exports, module ) {
	
	
var EventDispatcher = require('core/EventDispatcher'),
	UserData = require('core/UserData'),
	Matrix2D = require('core/Matrix2D'),
	StyleSheet = require('display/StyleSheet'),
	Tween = require('animation/Tween');
   
var tempDiv = document.createElement('div'),
	supportCanvas = !!document.createElement('canvas').getContext;
   	
var DisplayObject = EventDispatcher.extend({
	
	type: 'DisplayObject',
	
	x: 0, // 坐标
	y: 0,
	
	width: 0, // 尺寸
	height: 0,
	
	visible: true, // 基础样式
	overflow: 'visible',
	alpha: 1,
	shadow: null,
	
	transform: null, // 2d&3d变换
	transform3d: null,
	
	parent: null, // 关联节点&元素
	children: null,
	elem: null,
	elemStyle: null,

	renderMode: 0, // 渲染模式,  0: dom,  1: canvas,  2: webgl
	blendMode: 'source-over',
	mouseEnabled: true,
	
	updaters: null,
	
	_tagName: 'div', // 私有属性
	_matrix2d: null,
	_userData: null,

	init: function(props) {
		if (!props) props = {};
		// 设置渲染模式
		this.renderMode = props.renderMode !== undefined ? props.renderMode : this.renderMode;

		if (this.renderMode === 0) {
			// 初始化dom节点
			var elem = props.elem;
			if (typeof(elem) === 'string') {
				if (/^<.+>$/.test(elem)) {
					tempDiv.innerHTML = elem;
					elem = tempDiv.remove(tempDiv.children[0]);
				} else {
					elem = document.querySelector ? document.querySelector(elem) : null;
				}
			}
			this.elem = elem || document.createElement(this._tagName);
			this.elem.displayObj = this;
			this.elemStyle = this.elem.style;
			// 绑定jQuery
			if (window.jQuery) {
				this.$ = jQuery(this.elem);
			}
		} else {
			// 设置混色模式
			if (props.blendMode) {
				this.blendMode = props.blendMode;
			}
		}
		// 初始化属性
		this.children = [];
		this.updaters = [];
	    this._matrix2d = new Matrix2D();
		this._userData = new UserData();
		// 初始化样式
		for (var i in props) {
			if (StyleSheet.has(i)) {
				this.style(i, props[i]);
			}
		}
		// 初始化2d变换
		if (!this.transform) {
			StyleSheet.init(this, 'transform');
		}
	},
	
	add: function(child) {
		if (child.parent) {
			child.parent.remove(child);
		}
		child.parent = this;
		// 添加子节点
		this.children.push(child);
		
		if (child.renderMode === 0 && this.renderMode === 0) {
			this.elem.appendChild(child.elem);
		}
		
		this._addUpdater(child);
	},
	
	remove: function(child) {
		if (child.parent === this) {
			child.parent = null;
			// 移除子节点
			var children = this.children,
				index = children.indexOf(child);

			children.splice(index, 1);
			
			if (child.renderMode === 0 && this.renderMode === 0) {
				this.elem.removeChild(child.elem);
			}
			
			this._removeUpdater(child);
		}
	},
	
	removeAll: function() {
		var children = this.children,
			index, child;
		// 遍历移除子节点
		while (children.length) {
			index = children.length - 1;
			child = children[index];
			child.parent = null;
			children.splice(index, 1);
			
			if (child.renderMode === 0 && this.renderMode === 0) {
				this.elem.removeChild(child.elem);
			}
			
			this._removeUpdater(child);
		}
	},
	
	each: function(fn) {
		var children = this.children;
		// 遍历执行函数
		for (var i=0, l=children.length; i<l; i++) {
			fn(children[i], i);
		}
	},
	
	enable: function(enabled) {
		// 启用或禁用鼠标事件
		this.mouseEnabled = enabled ? true : false;
		if (this.renderMode === 0) {
			this.elemStyle.pointerEvents = enabled ? 'auto' : 'none';
		}
	},
	
	style: function(key, value) {
		// 设置样式，参见 jQuery.css()
		if (value === undefined) {
			if (typeof(key) === 'object') {
				for (var i in key) {
					StyleSheet.set(this, i, key[i]);
				}
			} else {
				return StyleSheet.get(this, key);	
			}
		} else {
			StyleSheet.set(this, key, value);
		}
	},
	
	data: function(key, value) {
		// 设置私有数据，参见 jQuery.data()
		if (value === undefined) {
			if (typeof(key) === 'object') {
				for (var i in key) {
					this._userData.set(i, key[i]);
				}
			} else {
				return this._userData.get(key);
			}
		} else {
			this._userData.set(key, value);
		}
	},

	to: function(props, duration, easing, callback, onframe) {
		// 创建补间动画，参见 jQuery.animate()
		Tween.get(this).addTween(props, duration, easing, callback, onframe);
		
		return this;
	},

	draw: function(ctx) {
		// canvas模式下绘制自己
		if (!this.children.length) return;
		
		if (this.overflow === 'hidden') {
			// 剪切溢出部分
		}
		
		var children = this.children, 
			child;
		// 遍历绘制子节点
		for (var i=0,l=children.length; i<l; i++) {
			child = children[i];
			// 判断是否可见
			if (child.visible) {
				child._drawCanvas(ctx);
			}
		}
	},
	
	cache: function(tag) {
		// 开启缓存，后期加入多缓存模式
		if (supportCanvas) {
			var canvas = document.createElement('canvas');
			canvas.width = this.width;
			canvas.height = this.height;
			
			this.draw(canvas.getContext('2d'));
			this._cacheCanvas = canvas;
		}
	},
	
	uncache: function() {
		// 关闭缓存
		this._cacheCanvas = null;
	},

	_stepStyle: function(key, fx) {
		// 补间动画逐帧更新样式
		StyleSheet.step(this, key, fx);
	},
	
	_isUpdater: function(obj) {
		// 判断是否有update函数或者事件
		return obj.update ||
			   obj.hasEventListener('update') ||
			   obj.type === 'DisplayObject';
	},
	
	_addUpdater: function(child) {
		// 当子节点为更新器时，添加到集合
		if (this._isUpdater(child)) {
			this.updaters.push(child);
		}
	},
	
	_removeUpdater: function(child) {
		if (this._isUpdater(child)) {
			var updaters = this.updaters,
				index = updaters.indexOf(child);
			updaters.splice(index, 1);	
		}
	},

	_eachUpdaters: function(delta) {
		var updaters = this.updaters,
			updater;
		for (var i = 0, len = updaters.length; i < len; i++) {
			updater = updaters[i];
	
			if (updater.hasEventListener('update')) {
				updater.trigger({ type: 'update', delta: delta });
			}
					
			if (updater.update) {
				updater.update(delta);	
			} 
			else if (updater.type === 'DisplayObject') {
				updater._eachUpdaters(delta);		
			}
		}
	},
	
	_updateTransform: function(key, value) {
		// 更新2d变换
		if (key === 'scale') {
			this.transform.scale = this.transform.scaleX = this.transform.scaleY = value;
		} else if (key in this.transform) {
			this.transform[key] = value;
		}
	},
	
	_updateTransform3D: function(key, value) {
		// 更新3d变换	
		if (key in this.transform3d) {
			this.transform3d[key] = value;
		}
	},
	
	_mergeTransformText: function() {
		// 合成2d变换的css样式
		var t2d = this.transform,
			value = '';
		if (t2d.translateX !== 0 || t2d.translateY !== 0) {
			value += 'translate('+t2d.translateX+'px,'+t2d.translateY+'px'+')';
		}
		if (t2d.rotate !== 0) {
		    value += ' rotate('+t2d.rotate+'deg)';
		}
		if (t2d.scaleX !== 1 || t2d.scaleY !== 1) {
			value += ' scale('+t2d.scaleX+','+t2d.scaleY+')';	
		}
		if (t2d.skewX !== 0 || t2d.skewY !== 0) {
			value += ' skew('+t2d.skewX+'deg,'+t2d.skewY+'deg)';
		}
		return value;
	},
	
	_mergeTransform3DText: function() {
		// 合成3d变换的css样式
		var t3d = this.transform3d,
			value = '';
		if (t3d.perspective !== 0) {
			value += 'perspective('+t3d.perspective+'px)';
		}
		if (t3d.translateX !== 0 || t3d.translateY !== 0 || t3d.translateZ !== 0) {
		    value += ' translate3d('+t3d.translateX+'px,'+t3d.translateY+'px,'+t3d.translateZ+'px)';
		}
		if (t3d.rotateX !== 0) {
		    value += ' rotateX('+t3d.rotateX+'deg)';
		}
		if (t3d.rotateY !== 0) {
		    value += ' rotateY('+t3d.rotateY+'deg)';
		}
		if (t3d.rotateZ !== 0) {
		    value += ' rotateZ('+t3d.rotateZ+'deg)';
		}
		if (t3d.scaleX !== 1 || t3d.scaleY !== 1 || t3d.scaleZ !== 1) {
			value += ' scale3d('+t3d.scaleX+','+t3d.scaleY+','+t3d.scaleZ+')';	
		}
		return value;
	},
	
	_drawCanvas: function(ctx) {
		ctx.save();
		// 更新上下文
		this._updateCanvasContext(ctx);
		// 绘制canvas
		if (this._cacheCanvas) {
			ctx.drawImage(this._cacheCanvas, 0, 0);
		} else {
			this.draw(ctx);
		}
		ctx.restore();
	},
	
	_updateCanvasContext: function(ctx) {
		// 更新2d上下文
		var mtx = this._updateMatrix2D(),
			dx = this._getAnchorX(),
			dy = this._getAnchorY(),
			shadow = this.shadow;
		// 设置2d变换
		if (dx === 0 && dy === 0) {
			ctx.transform(mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx, mtx.ty);
		} else {
			ctx.transform(mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx+dx, mtx.ty+dy);
			ctx.transform(1, 0, 0, 1, -dx, -dy);
		}
		// 设置透明度&混色模式
		ctx.globalAlpha *= this.alpha;
		ctx.globalCompositeOperation = this.blendMode;
		// 设置阴影
		if (shadow) {
			ctx.shadowOffsetX = shadow.offsetX;
			ctx.shadowOffsetY = shadow.offsetY;
			ctx.shadowBlur = shadow.blur;
			ctx.shadowColor = shadow.color;	
		}
	},

	_getAnchorX: function() {
		// 获取x轴锚点
		return this.width * this.transform.originX;
	},

	_getAnchorY: function() {
		// 获取y轴锚点
		return this.height * this.transform.originY;
	},

	_updateMatrix2D: function(ieMatrix) {
		// 计算2d矩阵
		var mtx = this._matrix2d.identity(),
			t2d = this.transform;
		if (ieMatrix) {
			return mtx.rotate(-t2d.rotate%360*Matrix2D.DEG_TO_RAD).scale(t2d.scaleX, t2d.scaleY);
		} else {
			return mtx.appendTransform(this.x+t2d.translateX, this.y+t2d.translateY, t2d.scaleX, t2d.scaleY, t2d.rotate, t2d.skewX, t2d.skewY);
		}
	}
	
});

DisplayObject.setRenderMode = function(mode) {
	if (mode === 'canvas' || mode === 1) {
		DisplayObject.prototype.renderMode = 1;
	} else {
		DisplayObject.prototype.renderMode = 0;
	}
}

return DisplayObject;
});

define( 'display/Container',['require','exports','module','display/DisplayObject'],function ( require, exports, module ) {
	
	   
var DisplayObject = require('display/DisplayObject');
	
var Container = DisplayObject.extend({

	type: 'Container',
	renderMode: 0,
	
	init: function(props) {
		this._super(props);
		this._initEvents(); // 初始化鼠标及触摸事件
	},
	
	update: function (delta) {
		this._eachUpdaters(delta);
	},
	
	_initEvents: function() {
		var self = this,
			elem = this.elem,
			mouseX, mouseY,
			target, moved,
			startX, startY;
		// 事件处理函数
		var handleDown = function(evt) {
			evt.preventDefault();
			mouseX = self._getMouseX(evt);
			mouseY = self._getMouseY(evt);
			// 检测点击对象
			target = self._hitTest(evt.target) || self;
			// 触发down事件
			self._triggerEvent('mousedown', target, mouseX, mouseY);
			// 标记起始状态
			moved = false;
			startX = mouseX;
			startY = mouseY;
		};
		var	handleUp = function(evt) {
			evt.preventDefault();
			// 触发up事件
			self._triggerEvent('mouseup', target, mouseX, mouseY);
			// 触发click事件
			if (!moved) {
				self._triggerEvent('click', target, mouseX, mouseY);
			}
			// 清除对象
			target = null;
		};
		var handleMove = function(evt) {
			evt.preventDefault();
			mouseX = self._getMouseX(evt);
			mouseY = self._getMouseY(evt);
			// 触发move事件
			self._triggerEvent('mousemove', target, mouseX, mouseY);
			// 检测移动状态
			if (!moved && (Math.abs(mouseX-startX) > 3 || Math.abs(mouseY-startY) > 3)) {
				moved = true;
			}
		};
		// 绑定事件
		if ('ontouchstart' in window) {
			elem.addEventListener('touchstart', handleDown, false);
			elem.addEventListener('touchend', handleUp, false);
			elem.addEventListener('touchmove', handleMove, false);
		} else {
			elem.addEventListener('mousedown', handleDown, false);
			elem.addEventListener('mouseup', handleUp, false);
			elem.addEventListener('mousemove', handleMove, false);
		}
	},
	
	_getMouseX: function(evt) {
		var point = evt.touches ? evt.touches[0] : evt,
			left = this.elem.getBoundingClientRect().left;
		return point.clientX - left;
	},
	
	_getMouseY: function(evt) {
		var point = evt.touches ? evt.touches[0] : evt,
			top = this.elem.getBoundingClientRect().top;
		return point.clientY - top;
	},
	
	_triggerEvent: function(eventName, target, mouseX, mouseY) {
		if (target) {
			// 创建事件
			var evt = { 
				type: eventName, srcTarget: target,
				mouseX: mouseX, mouseY: mouseY
			};
			// 事件冒泡执行
			while (target) {
				target.trigger(evt);
				target = target.parent;
			}
		}
	},
	
	_hitTest: function(elem) {
		var target;
		// 依次检测displayObj对象
		while (!target && elem && elem !== this.elem) {
			target = elem.displayObj;
			elem = elem.parentNode;
		}
		
		return target;
	}
	
});
	
return Container;
});

define( 'display/Canvas',['require','exports','module','display/DisplayObject','core/Matrix2D'],function ( require, exports, module ) {
	
	   
var DisplayObject = require('display/DisplayObject'),
	Matrix2D = require('core/Matrix2D');
	
var Canvas = DisplayObject.extend({
	
	type: 'Canvas',
	renderMode: 0,
	autoUpdate: false,
	useElemSize: true,
	
	_tagName: 'canvas',
	_context2d: null,
		
	init: function(props) {
		this._super(props);
		this._initEvents(); // 初始化鼠标及触摸事件
		this._context2d = this.elem.getContext('2d'); // 获取2d上下文
	},

	clear: function() {
		this._context2d.clearRect(0, 0, this.width, this.height);
	},

	update: function(delta) {
		this._eachUpdaters(delta);
			
		var ctx = this._context2d;
		// 重绘画布
		ctx.clearRect(0, 0, this.width, this.height);
		this.draw(ctx);
	},
	
	_initEvents: function() {
		var self = this,
			elem = this.elem,
			mouseX, mouseY,
			target, moved,
			startX, startY;
		// 事件处理函数
		var handleDown = function(evt) {
			evt.preventDefault();
			mouseX = self._getMouseX(evt);
			mouseY = self._getMouseY(evt);
			// 检测点击对象
			target = self._hitTest(self.children, mouseX, mouseY) || self;
			// 触发down事件
			self._triggerEvent('mousedown', target, mouseX, mouseY);
			// 标记起始状态
			moved = false;
			startX = mouseX;
			startY = mouseY;
		};
		var handleUp = function(evt) {
			evt.preventDefault();
			// 触发up事件
			self._triggerEvent('mouseup', target, mouseX, mouseY);
			// 触发click事件
			if (!moved) {
				self._triggerEvent('click', target, mouseX, mouseY);
			}
			// 清除对象
			target = null;
		};
		var	handleMove = function(evt) {
			evt.preventDefault();
			mouseX = self._getMouseX(evt);
			mouseY = self._getMouseY(evt);
			// 触发move事件
			self._triggerEvent('mousemove', target, mouseX, mouseY);
			// 检测移动状态
			if (!moved && (Math.abs(mouseX-startX) > 3 || Math.abs(mouseY-startY) > 3)) {
				moved = true;
			}
		};
		// 绑定事件
		if ('ontouchstart' in window) {
			elem.addEventListener('touchstart', handleDown, false);
			elem.addEventListener('touchend', handleUp, false);
			elem.addEventListener('touchmove', handleMove, false);
		} else {
			elem.addEventListener('mousedown', handleDown, false);
			elem.addEventListener('mouseup', handleUp, false);
			elem.addEventListener('mousemove', handleMove, false);
		}
	},
	
	_getMouseX: function(evt) {
		return evt.offsetX === undefined ? evt.layerX : evt.offsetX;
	},
	
	_getMouseY: function(evt) {
		return evt.offsetY === undefined ? evt.layerY : evt.offsetY;
	},
	
	_triggerEvent: function(eventName, target, mouseX, mouseY) {
		if (target) {
			// 创建事件
			var evt = { 
				type: eventName, srcTarget: target,
				mouseX: mouseX, mouseY: mouseY
			};
			// 事件冒泡执行
			while (target) {
				target.trigger(evt);
				target = target.parent;
			}
		}
	},
	
	_hitTest: function(children, mouseX, mouseY) {
		var child;
		// 遍历检测点击对象
		for (var i=children.length-1; i>=0; i--) {
			child = children[i];
			// 容器节点，递归检测
			if (child.children.length) {
				child = this._hitTest(child.children, mouseX, mouseY);
				if (child) {
					return child;	
				}
			}
			// 普通节点，检测矩阵
			else if (this._hitTestMatrix(child, mouseX, mouseY)) {	
				return child;
			}
		}
		
		return null;
	},
	
	_hitTestMatrix: function(child, mouseX, mouseY) {
		// 不可见或者不可点击时跳过检测
		if (!child.visible || !child.mouseEnabled) return false;
		// 执行检测
		var matrix = new Matrix2D(),
			objs = [],
			dx, dy, mtx;
		// 依次加入层节点
		while (child && child !== this) {
			objs.unshift(child);
			child = child.parent;
		}
		// 运算鼠标偏移量
		matrix.append(1, 0, 0, 1, -mouseX, -mouseY);
		// 矩阵运算
		for (var i=0, l=objs.length; i<l; i++) {
			child = objs[i];
			mtx = child._matrix2d;
			dx = child._getAnchorX();
			dy = child._getAnchorY();
			// 添加节点矩阵
			if (dx === 0 && dy === 0) {
				matrix.append(mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx, mtx.ty);
			} else {
				matrix.append(mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx+dx, mtx.ty+dy);
				matrix.append(1, 0, 0, 1, -dx, -dy);
			}
		}
		// 反转矩阵，计算相对位置
		matrix.invert();
		// 判断鼠标位置
		var x = matrix.tx, 
			y = matrix.ty,
			r = child.radius,
			w = child.width,
			h = child.height;
		if (r) {
			return r*r >= (x-r)*(x-r) + (y-r)*(y-r);
		}
		else if (w && h) {
			return x >= 0 && x <= w && y >= 0 && y <= h;
		}
		
		return false;
	}
	
});
	
return Canvas;
});

define( 'display/Graphics2D',['require','exports','module'],function ( require, exports, module ) {
	
	   
var Graphics2D = function() {};

Graphics2D.get = function(type) {
	// 获取2d图形
	return Graphics2D.shapes[type];
}

Graphics2D.commonStyle = function(target, data) {
	if (data.stroke && data.lineWidth === undefined) {
		data.lineWidth = 1;
	}
	// 设置绘图样式
	target.style('fill', data.fill);
	target.style('stroke', data.stroke);
	target.style('lineWidth', data.lineWidth);
}

Graphics2D.commonDraw = function(ctx, hasFill, hasStroke) {
	// 绘制图形
	if (hasFill) ctx.fill();
	if (hasStroke) ctx.stroke();
}

Graphics2D.shapes = {
	rect: {
		type: 'rect',
		init: function(data) {
			this.style('size', data);
			// 设置通用样式
			Graphics2D.commonStyle(this, data);
		},
		draw: function(ctx) {
			// 绘制矩形
			if (this.setFill(ctx)) {
				ctx.fillRect(0, 0, this.width, this.height);
			}
			if (this.setStroke(ctx)) {
				ctx.strokeRect(0, 0, this.width, this.height);
			}
		}
	},
	
	circle: {
		type: 'circle',
		init: function(data) {
			if (data.angle === undefined) {
				data.angle = 360;
			}
			this.style('radius', data.radius);
			this.style('angle', data.angle);
			// 设置通用样式
			Graphics2D.commonStyle(this, data);
		},
		draw: function(ctx) {
			var radius = this.radius,
				hasFill = this.setFill(ctx),
				hasStroke = this.setStroke(ctx);
			// 绘制圆
			ctx.beginPath();
			ctx.arc(radius, radius, radius, 0, this.angle/360 * Math.PI*2, 0);
			if (this.angle < 360) {
				ctx.lineTo(radius, radius);
			}
			ctx.closePath();
			Graphics2D.commonDraw(ctx, hasFill, hasStroke);
		}
	},
	
	ellipse: {
		type: 'ellipse',
		init: function(data) {
			this.style('radiusXY', data);
			// 设置通用样式
			Graphics2D.commonStyle(this, data);
		},
		draw: function(ctx) {
			var k = 0.5522848,
				rx = this.radiusX,
				ry = this.radiusY,
				kx = rx * k,
				ky = ry * k,
				w = rx * 2,
				h = ry * 2,
				hasFill = this.setFill(ctx),
				hasStroke = this.setStroke(ctx);
			// 绘制椭圆
			ctx.beginPath();
			ctx.moveTo(0, ry);
			ctx.bezierCurveTo(0, ry-ky, rx-kx, 0, rx, 0);
			ctx.bezierCurveTo(rx+kx, 0, w, ry-ky, w, ry);
			ctx.bezierCurveTo(w, ry+ky, rx+kx, h, rx, h);
			ctx.bezierCurveTo(rx-kx, h, 0, ry+ky, 0, ry);
			ctx.closePath();
			Graphics2D.commonDraw(ctx, hasFill, hasStroke);
		}
	},
	
	line: {
		type: 'line',
		init: function(data) {
			if (data.lineWidth === undefined) {
				data.lineWidth = 1;
			}
			this.path = data.path;
			this.style('stroke', data.stroke);
			this.style('lineWidth', data.lineWidth);
		},
		draw: function(ctx) {
			var path = this.path, line, 
				hasStroke = this.setStroke(ctx);
			// 绘制线段
			if (hasStroke && path.length > 1) {
				ctx.beginPath();
				for (var i=0, l=path.length; i<l; i++) {
					line = path[i];
					if (i === 0) {
						ctx.moveTo(line[0], line[1]);
					} else {
						if (line.length === 2) {
							ctx.lineTo(line[0], line[1]);	
						} else if (line.length === 4) {
							ctx.quadraticCurveTo(line[0], line[1], line[2], line[3]);		
						} else if (line.length === 6) {
							ctx.bezierCurveTo(line[0], line[1], line[2], line[3], line[4], line[5]);		
						}
					}
				}
				ctx.stroke();
			}
		}
	},
	
	ploygon: {
		type: 'ploygon',
		init: function(data) {
			this.path = data.path;
			// 设置通用样式
			Graphics2D.commonStyle(this, data);
		},
		draw: function(ctx) {
			var path = this.path, line,
				hasFill = this.setFill(ctx),
				hasStroke = this.setStroke(ctx);
			// 绘制多边形
			if (path.length > 2) {
				ctx.beginPath();
				for (var i=0, l=path.length; i<l; i++) {
					line = path[i];
					if (i === 0) {
						ctx.moveTo(line[0], line[1]);
					} else {
						if (line.length === 2) {
							ctx.lineTo(line[0], line[1]);	
						} else if (line.length === 4) {
							ctx.quadraticCurveTo(line[0], line[1], line[2], line[3]);		
						} else if (line.length === 6) {
							ctx.bezierCurveTo(line[0], line[1], line[2], line[3], line[4], line[5]);		
						}
					}
				}
				ctx.closePath();
				Graphics2D.commonDraw(ctx, hasFill, hasStroke);
			}
		}
	},
	
	polyStar: {
		type: 'polyStar',
		init: function(data) {
			this.sides = data.sides;
			this.cohesion = data.cohesion;
			this.style('radius', data.radius);
			// 设置通用样式
			Graphics2D.commonStyle(this, data);
		},
		draw: function(ctx) {
			var radius = this.radius,
				sides = this.sides,
				cohesion = this.cohesion,
				angle, x, y, 
				hasFill = this.setFill(ctx),
				hasStroke = this.setStroke(ctx);
			// 绘制等多边形
			ctx.beginPath();
			for (var i=0; i<sides; i++) {
				angle = i/sides * Math.PI*2;
				x = (1 - Math.sin(angle)) * radius;
				y = (1 - Math.cos(angle)) * radius;
				if (i === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
				if (cohesion) {
					angle += Math.PI/sides;
					x = (1 - Math.sin(angle) * cohesion) * radius;
					y = (1 - Math.cos(angle) * cohesion) * radius;
					ctx.lineTo(x, y);
				}
			}
			ctx.closePath();
			Graphics2D.commonDraw(ctx, hasFill, hasStroke);
		}
	},
	
	roundRect: {
		type: 'roundRect',
		init: function() {
			
		},
		draw: function() {
			
		}
	},
	
	lines: {
		type: 'lines',
		init: function(data) {
			if (data.lineWidth === undefined) {
				data.lineWidth = 1;
			}
			this.paths = data.paths;
			this.style('stroke', data.stroke);
			this.style('lineWidth', data.lineWidth);
		},
		draw: function(ctx) {
			var paths = this.paths,
				path, line, 
				hasStroke = this.setStroke(ctx);
			// 绘制多重线段
			if (hasStroke && paths.length) {
				ctx.beginPath();
				for (var j=0, jl=paths.length; j<jl; j++) {
					path = paths[j];
					if (path.length > 1) {
						for (var i=0, l=path.length; i<l; i++) {
							line = path[i];
							if (i === 0) {
								ctx.moveTo(line[0], line[1]);
							} else {
								if (line.length === 2) {
									ctx.lineTo(line[0], line[1]);	
								} else if (line.length === 4) {
									ctx.quadraticCurveTo(line[0], line[1], line[2], line[3]);		
								} else if (line.length === 6) {
									ctx.bezierCurveTo(line[0], line[1], line[2], line[3], line[4], line[5]);		
								}
							}
						}
					}
				}
				ctx.stroke();
			}
		}
	}
}

return Graphics2D;
});

define( 'display/Shape',['require','exports','module','display/DisplayObject','display/Graphics2D'],function ( require, exports, module ) {
	
	   
var DisplayObject = require('display/DisplayObject'),
	Graphics2D = require('display/Graphics2D');
	
var Shape = DisplayObject.extend({

	type: 'Shape',
	
	graphics: null,
	snapToPixel: true,
	
	init: function(props) {
		this._super(props);
		this._initGraphics(props.graphics); // 初始化图形
	},
	
	draw: function(ctx) {
		// 绘制图形
		if (this.graphics) {
			this.graphics.draw.call(this, ctx);
		}
	},
	
	setFill: function(ctx) {
		var style = this.fillColor,
			gradient = this.fillGradient,
			image = this.fillImage;
		if (image) {
			// 使用位图填充
			if (image.complete) {
				style = ctx.createPattern(image, 'no-repeat');
			}
		} else if (gradient) {
			// 使用渐变填充
			switch (gradient[0]) {
				case 'top': case 'bottom':
					style = ctx.createLinearGradient(0, 0, 0, this.height);
					break;
				case 'left': case 'right':
					style = ctx.createLinearGradient(0, 0, this.width, 0);
					break;
				case 'left top':
					style = ctx.createLinearGradient(0, 0, this.width, this.height);
					break;
				case 'right top':
					style = ctx.createLinearGradient(this.width, 0, 0, this.height);
					break;
				case 'center':
					var radiusX = this.width / 2,
						radiusY = this.height / 2;
					style = ctx.createRadialGradient(radiusX, radiusY, 0, radiusX, radiusY, radiusX>radiusY ? radiusX : radiusY);
					break;
			}
			style.addColorStop(0.0, gradient[1]);
			style.addColorStop(1.0, gradient[2]);
		}
		// 设置fillStyle
		if (style) {
			ctx.fillStyle = style;
			return true;
		}
		return false;
	},
	
	setStroke: function(ctx) {
		var style = this.strokeColor,
			lineWidth = this.lineWidth;
		// 设置strokeStyle
		if (style && lineWidth) {
			ctx.strokeStyle = style;
			ctx.lineWidth = lineWidth;
			ctx.lineCap = this.lineCap || 'round';
			ctx.lineJoin = this.lineJoin || 'round';
			// 解决画线模糊的问题
			if (this.snapToPixel && lineWidth === 1) {
				var mtx = this._matrix2d;
				ctx.translate(mtx.tx>=0 ? 0.5 : -0.5, mtx.ty>=0 ? 0.5 : -0.5);
			}
			return true;
		}
		return false;
	},
		
	_initGraphics: function(graphics) {
		var type = graphics.type,
			graphics2d = type ? Graphics2D.get(type) : graphics;
		// 初始化2d图形
		if (graphics2d && graphics2d.init && graphics2d.draw) {
			this.graphics = graphics2d;
			graphics2d.init.call(this, graphics);
		}
	}
	
});

return Shape;
});

define( 'display/Filter',['require','exports','module'],function ( require, exports, module ) {
	
	
var Filter = function() {};

Filter.get = function(image, type, value) {
	var filter = Filter.filters[type];
	// 获取滤镜处理后的图像
	if (filter) {
		return filter(image, value);
	}
};

Filter.filters = {
	grayscale: function(image, value) {
		// 处理灰阶效果
		var canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		
		var ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0);
		
		var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
			data = imageData.data,
			pixel;
			
		for (var i=0, l=data.length; i<l; i+=4) {
			pixel = (data[i] + data[i+1] + data[i+2]) / 3;
			data[i] = data[i+1] = data[i+2] = pixel;
		}
	
		ctx.putImageData(imageData, 0, 0);
	
		return canvas;
	},
	
	brightness: function(image, value) {
		// 处理高亮效果
		var canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		
		var ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0);
		
		ctx.globalCompositeOperation = 'lighter';
		ctx.drawImage(image, 0, 0);
		
		return canvas;	
	},
	
	impression: function(image, value) {
		// 处理印象派效果
		var canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		
		var ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0);
		
		var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
			data = imageData.data,
			text = ['1', '0'],
			pixels = [];
			
		for (var i=0, l=data.length; i<l; i+=16) {
			if (Math.floor(i / 4 / canvas.width) % 4) {
				continue;
			}
			pixels.push([
				'rgba('+ data[i] +','+ data[i+1] +','+ data[i+2] +','+ data[i+3] +')', // color
				text[ Math.floor( Math.random() * text.length ) ], // text
				i / 4 % canvas.width, // x
				Math.floor(i / 4 / canvas.width) // y
			]);
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.font = '40px Microsoft Yahei';
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';
		ctx.globalAlpha = 0.25;

		var idx, pixel;
		while (pixels.length) {
			idx = Math.floor(Math.random() * pixels.length);
			pixel = pixels[idx];
			ctx.fillStyle = pixel[0];
			ctx.fillText(pixel[1], pixel[2], pixel[3]);
			pixels.splice(idx, 1);
		}
		
		return canvas;
	},
	
	rilievo: function(image, value) {
		// 处理浮雕效果
		var canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		
		var ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0);
		
		var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
			data = imageData.data,
			next, diff, pixel,
			test = function(val) {
				// 判断是否超出范围
				if (val < 0) {
					val = 0;
				} else if (val > 255) {
					val = 255;
				}
				return val;
			};
			
		for (var i=0, l=data.length; i<l; i+=4) {
			next = i+4;
			if (data[next] === undefined) {
				next = i;
			}
			diff = Math.floor((data[next] + data[next+1] + data[next+2]) - (data[i] + data[i+1] + data[i+2]));
			pixel = test(diff + 128);
			data[i] = data[i+1] = data[i+2] = pixel;
		}
	
		ctx.putImageData(imageData, 0, 0);
	
		return canvas;
	}
}
	
return Filter;
});

define( 'display/Bitmap',['require','exports','module','display/DisplayObject','core/Preload','display/Filter'],function ( require, exports, module ) {
	

var DisplayObject = require('display/DisplayObject'),
	Preload = require('core/Preload'),
	Filter = require('display/Filter');

var supportCanvas = !!document.createElement('canvas').getContext,
	divStyle = document.createElement('div').style,
	prefix = divStyle.webkitTransform === ''? 'webkit' :
    		 divStyle.WebkitTransform === ''? 'Webkit' :
    		 divStyle.msTransform === ''? 'ms' :
    		 divStyle.MozTransform === ''? 'Moz' : 'ct';

var Bitmap = DisplayObject.extend({
	
	type: 'Bitmap',
		
	_image: null,
	_clipRect: null,
	_srcCanvas: null,
	_scaleToFit: false,
	
	init: function(props) {
		this._super(props);
		this._initImage(props); // 初始化图像资源
	},
		
	draw: function(ctx) {
		if (this._image.complete) {
			var image = this._srcCanvas || this._image;

			if (this._clipRect) { // 处理剪裁
				ctx.drawImage(image, this._clipRect[0], this._clipRect[1], this.width, this.height, 0, 0, this.width, this.height);
			} 
			else if (this._scaleToFit) { // 处理平铺
				ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, this.width, this.height);
			} 
			else { // 绘制image
				ctx.drawImage(image, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
			}
		}
	},
	
	applyFilter: function(type, value) {
		if (this.renderMode === 0) { // dom方式添加滤镜
			this.elemStyle[prefix + 'Filter'] = type ? (type + '(' + value + ')') : '';
		} 
		else if (this.renderMode === 1) { // canvas方式添加滤镜
			var image = this._image;
			
			if (image.complete) {
				this._srcCanvas = (type && supportCanvas) ? Filter.get(image, type, value) : null;
			} 
			else {
				var self = this;
				// 兼容低版本ie		
				if (!image.addEventListener) {
					image.addEventListener = image.attachEvent;
				}
				// 加载完成后执行
				image.addEventListener('load', function() {
					self.applyFilter(type, value);
				});
			}
		}	
	},
	
	_initImage: function(props) {
		var image = props.image;
		
		if (props.sourceRect) { // 剪裁
			this._clipRect = props.clipRect || props.sourceRect;
			this.style('size', { width: this._clipRect[2], height: this._clipRect[3] });
		}
		else if (props.scaleToFit)  { // 平铺 
			this._scaleToFit = props.scaleToFit;
		}
		
		if (this.renderMode === 0) { // dom方式渲染
			this.elemStyle.backgroundImage = 'url('+image+')';	
			this.elemStyle.backgroundRepeat = 'no-repeat';
			if (this._clipRect) { // 处理剪裁
				this.elemStyle.backgroundPosition = '-' + this._clipRect[0] + 'px -' + this._clipRect[1] + 'px';
			} 
			else if (this._scaleToFit) { // 处理平铺
				this.elemStyle.backgroundSize = '100% 100%';
			}
		}
		else if (this.renderMode === 1) { // canvas方式渲染
			if (typeof(image) === 'string') {
				if (!Preload.hasItem(image)) { // 初始化image
					Preload.loadFile({ type: 'image', url: image });
				}
				this._image = Preload.getItem(image);
			} else {
				this._image = image;
			}
		}
	}
	
});
	
return Bitmap;
});

define( 'display/Text',['require','exports','module','display/DisplayObject'],function ( require, exports, module ) {
	

var DisplayObject = require('display/DisplayObject');
	
var Text = DisplayObject.extend({
	
	type: 'Text',
	text: null,
	
	init: function(props) {
		this._super(props);
		this._initText(props); // 初始化文本
	},
		
	value: function (text) {
		if (text === undefined) {
			return this.text;
		} else {
			this.text = text;
			if (this.renderMode === 0) {
				this.elem.innerHTML = text;
			}
		}
	},
	
	draw: function(ctx) {
		// 绘制文本
		ctx.font = this.font;
		ctx.textAlign = this.textAlign;
		ctx.textBaseline = this.textBaseline;
		ctx.fillStyle = this.textColor;
		ctx.fillText(this.text, 0, 0);
	},

	_initText: function(props) {
		// 初始化文本
		this.font = props.font || '20px Microsoft Yahei';
		this.textAlign = props.align || 'left';
		this.textBaseline = props.baseline || 'top';
		this.textColor = props.color || 'black';
		
		this.value(props.text || '');
		
		if (this.renderMode === 0) {
			this.elemStyle.color = this.textColor;
		}
	}

});

return Text;
});

define( 'animation/Timeline',['require','exports','module','core/EventDispatcher','animation/Ease'],function ( require, exports, module ) {
	
	   
var EventDispatcher = require('core/EventDispatcher'),
	Ease = require('animation/Ease');

var Timeline = EventDispatcher.extend({
	
	_paused: true,
	_loop: false,
	
	_targets: null,
	_currentTarget: null,

	_deltaTime: -1,
	_duration: -1,
	
	init: function(props) {
		this._paused = false;
		this._loop = props ? !!props.loop : false;
		
		this._targets = []; // 执行对象集合
		this._deltaTime = 0; // 动画当前时间 
		this._duration = 0; // 动画持续时间		
	},
	
	play: function(timepoint) {
		// 开启播放
		if (typeof(timepoint) === 'number') {
			this.gotoAndPlay(timepoint);
		} else {
			this._paused = false;
		}
	},
	
	stop: function() {
		// 停止播放
		this._paused = true;
	},
	
	gotoAndPlay: function(timepoint) {
		this._paused = false;
		// 从指定时间播放
		this._deltaTime = timepoint;
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
	
	get: function(target) {
		if (!this.has(target)) {
			// 初始化对象的动画参数
			this.removeKeyframes(target);
			target.data('tl_queue', []);
			target.data('tl_start', {});
			// 添加对象到集合
			this._targets.push(target);
		}
		// 设置当前对象		
		this._currentTarget = target;
		
		return this;
	},

	getTime: function() {
		// 获取当前时间
		return this._deltaTime;
	},
		
	addKeyframe: function(props, timepoint, easing, callback) {
		var target = this._currentTarget,
			queue = target.data('tl_queue'),
			start = target.data('tl_start');
		// 获取初始状态
		for (var i in props) {
			start[i] = this._clone(target.style(i));
		}
		// 添加参数到队列
		queue.push([props, timepoint, easing || 'linear', callback]);
		queue.sort(function(a, b) {
			return a[1] - b[1];
		});
		
		var steps = [],
			step,
			from = 0;
		// 创建动画过程
		for (var i=0, l=queue.length; i<l; i++) {
			step = queue[i];
			// 添加新的动画过程
			steps.push({
				from: from, to: step[1], // 开始时间和结束时间
				start: start, end: step[0], // 开始状态和结束状态
				easing: step[2], callback: step[3] // 过渡函数和回调函数
			})
			// 更新开始时间和状态
			from = step[1];
			start = this._merge(start, step[0]);
		}
		// 设置动画持续时间		
		if (this._duration < from) {
			this._duration = from;
		}
		target.data('tl_steps', steps);

		return this;
	},
	
	removeKeyframes: function(target) {
		// 移除所有关键帧
		target.data('tl_queue', null);
		target.data('tl_start', null);
		target.data('tl_steps', null);
		target.data('tl_cur_step', null);
	},
	
	update: function(delta) {
		if (this._paused) return;
		
		var targets = this._targets,
			target,
			step;
		// 获取动画参数	
		var now = this._deltaTime,
			duration = this._duration;
		// 遍历执行对象
		for (var i=0, l=targets.length; i<l; i++) {
			target = targets[i];
			// 获取当前过渡动画
			step = this._getStep(target, now);
			// 更新当前过渡动画
			if (step) {
				this._updateStep(target, step, now);
				// 动画结束时执行最后帧的回调
				if (now === duration && step.to === duration && step.callback) {
					step.callback(now);
				}
			}
		}
		// 判断动画是否结束
		if (now === duration) {
			if (this._loop) { // 循环播放
				this._deltaTime = 0;
			} else { // 停止播放
				this.stop();
			}
			// 触发动画结束事件
			this.trigger({ type: 'animationend' });
		} else {
			// 更新执行时间
			var nextTime = now + delta;
			this._deltaTime = nextTime > duration ? duration : nextTime;
		}
	},
	
	_getStep: function(target, now) {
		var curStep = target.data('tl_cur_step');
		// 判断时间是否超出动画区间
		if (curStep) {
			if (now >= curStep.from && now <= curStep.to) {
				return curStep; // 没有超出返回当前动画
			} else {
				if (now > curStep.to && curStep.callback) {
					curStep.callback(now); // 执行回调
				}
				target.data('tl_cur_step', null);
			}
		}
	
		var steps = target.data('tl_steps'),
			duration = steps[steps.length - 1].to,
			step;
		// 获取当前过渡动画	
		if (now <= duration) {
			for (var i=0, l=steps.length; i<l; i++) {
				step = steps[i];
				if (now >= step.from && now <= step.to) {
					target.style(step.start); // 初始化样式
					target.data('tl_cur_step', step);
					return step;
				}
			}
		}
		
		return null;
	},
	
	_updateStep: function(target, step, now) {
		if (step.to === step.from) {
			// 当动画为单帧时，直接更新样式
			target.style(step.end);
			return;
		}
		var duration = step.to - step.from,
			easing = Ease.get(step.easing),
			percent = (now - step.from) / duration,
			pos = easing(percent, percent, 0, 1, 1),
			start = step.start,
			end = step.end;			
		// 设置过渡样式
		for (var i in end) {
			target._stepStyle(i, {
				pos: pos, start: start[i], end: end[i]
			});
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
	},
	
	_merge: function(origin, extension) {
		var temp = this._clone(origin);
		
		if (typeof(extension) === 'object') {
			for (var i in extension) {
				if (typeof(temp[i]) === 'object' && typeof(extension[i]) === 'object') {
					for (var j in extension[i]) {
						temp[i][j] = extension[i][j];
					}
				} else {
					temp[i] = extension[i];
				}
			}
 		} else {
			temp = extension;
		}
		return temp;
	}

});

return Timeline;
});

define( 'animation/Sprite',['require','exports','module','display/DisplayObject','core/Preload'],function ( require, exports, module ) {
	
	   
var DisplayObject = require('display/DisplayObject'),
	Preload = require('core/Preload');

var Sprite = DisplayObject.extend({
	
	type: 'Sprite',
	
	_paused: true,

    _images: null,
    _imageIndex: -1,

    _frames: null,
    _frameIndex: -1,
    _currentFrame: null,

    _animations: null,
    _currentAnimation: null,
    _deltaTime: -1,
    
    init: function(props) {
		this._super(props);
		// 初始化精灵序列帧
		this._initSpriteSheet(props.spriteSheet);
	},
	
    play: function(name) {
    	// 开启播放
		if (typeof(name) === 'string') {
			this.playAnimation(name);
		} else if (typeof(name) === 'number') {
			this.gotoAndPlay(name);
		} else {
			this._paused = false;
		}
    },
    
    stop: function() {
    	// 停止播放
    	this._paused = true;
    },
    
   	gotoAndPlay: function(index) {
   		this._paused = false;
   		// 播放序列帧
   		this._currentAnimation = null;
   		this._frameIndex = index;
   	},
   	
    gotoAndStop: function(index) {
    	this._paused = true;
    	// 播放单帧
    	this._currentAnimation = null;
   		this._frameIndex = index;
    },
    
    playAnimation: function(name) {
   		this._paused = false;
   		// 播放动画
   		var animation = this._animations[name];
		if (animation) {
	        this._currentAnimation  = animation;
	        this._frameIndex = animation.start;
			this._deltaTime = 0;
	  	}	
    },
    
    update: function(delta) {
     	if (this._paused) return;
     	// 更新当前帧
     	this._updateFrame();
     	
     	var name, start, end, next, duration,
     		animation = this._currentAnimation;
     	// 获取动画参数
     	if (animation) {
     		name = animation.name;
     		start = animation.start;
     		end = animation.end;
     		next = animation.next;
     		duration = animation.duration;
     	} else {
     		name = null;
     		start = 0;
     		end = this._frames.length - 1;
     		next = true;
     		duration = 0;
     	}
		
		var nextFrameIdx;
		// 计算下一帧
     	if (duration > 0) {
     		this._deltaTime += delta;
     		nextFrameIdx = Math.floor((end - start + 1) * (this._deltaTime / duration) + start);
     	} else {
     		nextFrameIdx = this._frameIndex + 1;
     	}
		// 判断动画是否结束
		if (nextFrameIdx > end) {
			if (typeof(next) === 'string') { // 播放下一个动画
				this.playAnimation(next);
			} else if (next === true) { // 循环播放
				this._frameIndex = start;
			} else { // 停止播放
				this.stop();
			}
			// 触发动画结束事件
			this.trigger({ type: 'animationend', name: name, animation: animation });
		} else {
			this._frameIndex = nextFrameIdx;
		}
	},
       
    draw: function(ctx){
     	var frame = this._currentFrame;
     	// 绘制当前帧
     	if (frame) {
	     	var	image = this._images[frame[4]];
	     	if (image && image.complete) {
	     		ctx.drawImage(image, frame[0], frame[1], frame[2], frame[3], frame[5], frame[6], frame[2], frame[3]);
	     	}
     	}
     },

	_initSpriteSheet: function(spriteSheet) {
		this._initImages(spriteSheet.images);
        this._initFrames(spriteSheet.frames);
        this._initAnimations(spriteSheet.animations);
     },
	
	_initImages: function(images) {
		this._images = [];
		// 初始化图片资源
		var image;
		for (var i=0, l=images.length; i<l; i++) {
			image = images[i];
			if (this.renderMode !== 0) {
				if (!Preload.hasItem(image)) { // 初始化image
					Preload.loadFile({ type: 'image', url: image });
				}
				image = Preload.getItem(image);
			}
			this._images.push(image);
		}
	},
	
	_initFrames: function(frames, append) {
		if (!append) {
			this._frames = [];
		}
		// 初始化序列帧
		if (frames instanceof Array) {
			for (var i=0, l=frames.length; i<l; i++) {
				if (frames[i] instanceof Array) {
					this._frames.push(frames[i]);
				} else {
					this._initFrames(frames[i], true);
				}
			}
		} else {
			// 自动切帧
			for (var j=0, jl=frames.rows; j<jl; j++) {
				for (var i=0, l=frames.cols; i<l; i++) {
					if ((j*frames.cols + i) === frames.num) {
						break;
					} else {
						this._frames.push([
							i*frames.width, j*frames.height, // 剪裁坐标
							frames.width, frames.height, // 剪裁尺寸
							frames.image || 0, // 剪裁图片 
							0, 0 // 剪裁偏移坐标
						]);	
					}
				}
			}	
		}
	},
	
	_initAnimations: function(animations) {
		this._animations = {};
		// 初始化动画
		var animation;
		for (var i in animations) {
			animation = animations[i];
			this._animations[i] = {
				name: i, // 动画名
				start: animation[0], // 开始帧下标
				end: animation[1], // 结束帧下标
				next: animation[2], // 下一个动画
				duration: animation[3] // 持续时间
			}
		}
	},
	
	_updateFrame: function() {
		var frame = this._currentFrame 
				  = this._frames[this._frameIndex];
		// 设置当前帧
		if (frame) {
			// 设置帧尺寸
			if (this.width !== frame[2] || this.height !== frame[3]) {
	        	this.style('size', { width: frame[2], height: frame[3] });
	        }
			if (this.renderMode === 0) {
				var style = this.elemStyle;
	        	// 设置剪裁图片
	        	if (this._imageIndex !== frame[4]) {
	        		this._imageIndex = frame[4];
	        		style.backgroundImage = 'url('+ this._images[frame[4]] +')';
	        		style.backgroundRepeat = 'no-repeat';
	        	}
	        	// 设置剪裁坐标
	        	style.backgroundPosition = '-'+ frame[0] +'px -'+ frame[1] +'px';
	        }
		}
	}
	
});

return Sprite;
});
define( 'extra/ParticleEmitter',['require','exports','module','display/Shape','display/Bitmap'],function ( require, exports, module ) {
	
	
var	Shape = require('display/Shape'),
	Bitmap = require('display/Bitmap');
	   
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
					pos: { x: Math.floor(Math.random()*width), y: -Math.floor(Math.random()*height) },
					graphics: {
						type: 'rect', width: i%6===0?3:2, height: i%3===0?28:20, fill: '#FFF'
					},
					alpha: Math.floor(Math.random()*3)/10+0.2
				});
				
				particle.data('fall_speed', Math.floor(Math.random()*25)/100+0.25);
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
					y = -Math.floor(Math.random()*height);
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
				radius, pos, alpha;

			this.particles = [];
			this.data('fall_width', width);
			this.data('fall_height', height);
			// 初始化雪花粒子
			for (var i=0, l=data.num||60; i<l; i++) {
				pos = { x: Math.floor(Math.random()*width), y: -Math.floor(Math.random()*height) };
				radius = Math.floor(Math.random()*10)+15;
				alpha = Math.floor(Math.random()*4)/10+0.6;
				
				particle = image ? new Bitmap({
					renderMode: this.renderMode,
					pos: pos, width: radius, height: radius, scaleToFit: true,
					image: image, alpha: alpha
				}) : new Shape({
					renderMode: this.renderMode,
					pos: pos, alpha: Math.floor(Math.random()*5)/10 + 0.3,
					graphics: {
						type: 'circle', radius: Math.floor(Math.random()*3) + 4, fill: '#FFF', angle: 360
					}
				});
				
				particle.data('fall_x', particle.x);
				particle.data('fall_width', Math.floor(Math.random()*10 + 10));
				particle.data('fall_speed', Math.floor(Math.random()*15 + 15)/1000);
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
					y = -Math.floor(Math.random()*height);
				}
				particle.style('pos', { x: x + Math.sin(y / (spd*2000)) * particle.data('fall_width'), y: y + dis });
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

define( 'extra/ParticleSystem',['require','exports','module','display/DisplayObject','extra/ParticleEmitter'],function ( require, exports, module ) {
	
	   
var DisplayObject = require('display/DisplayObject'),
	ParticleEmitter = require('extra/ParticleEmitter');

var ParticleSystem = DisplayObject.extend({
	
	type: 'ParticleSystem',	
	emitter: null,
	particles: null,
	
	_paused: true,
	
	init: function(props) {
		this._super(props);
		this._initParticle(props.particle); // 初始化粒子
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

define( 'extra/SkeletalAnimation',['require','exports','module','display/DisplayObject','display/Bitmap','animation/Timeline'],function ( require, exports, module ) {
	

var DisplayObject = require('display/DisplayObject'),
	Bitmap = require('display/Bitmap'),
	Timeline = require('animation/Timeline');

var SkeletalAnimation = DisplayObject.extend({
	
	type: 'SkeletalAnimation',
	_paused: true,
	
	_bones: null,
	
	_animations: null,
	_currentAnimation: null,
	_timeline: null,
	
	init: function(props) {
		this._super(props);
		// 初始化骨骼节点
		this._initBones(props); 
	},

	play: function(name) {
		// 开启播放
		if (typeof(name) === 'string') {
			this.playAnimation(name);
		} else {
			this._paused = false;
		}
	},
	
	stop: function() {
		// 停止播放
		this._paused = true;
	},
	
	playAnimation: function(name) {
		this._paused = false;
		// 播放动画
		var animation = this._animations[name];
        if (animation) {
            this._currentAnimation = animation;
            this._timeline = this._initTimeline(animation); // 创建动画时间轴
  		}
	},
	
	update: function(delta) {
		if (this._paused) return;
		// 播放时间轴动画
		if (this._timeline) {
			this._timeline.update(delta);	
		}
	},
	
	_initBones: function(props) {
		this._bones = {};
		this._animations = {};
		
		var bones = props.bones,
			animations = props.animations,
			bone, displayObj;
		// 创建骨骼节点
		for (var i=0, l=bones.length; i<l; i++) {
			bone = bones[i];

			if (bone.image) { // 图像节点
				displayObj = new Bitmap({
					renderMode: this.renderMode,
					x: 0, y: 0, width: bone.width, height: bone.height,
					image: bone.image
				});
			} else { // 容器节点
				displayObj = new DisplayObject({
					renderMode: this.renderMode,
					x: 0, y: 0, width: bone.width, height: bone.height
				});
			}
			
			if (!bone.parent) { // 添加根节点
				this.add(displayObj);
			}
			
			this._bones[bone.tag] = displayObj;
		}
		// 添加全部子节点
		for (var i=0, l=bones.length; i<l; i++) {
			bone = bones[i];

			if (bone.parent) { // 添加子节点
				this._bones[bone.parent].add(this._bones[bone.tag]);	
			}		
		}
		// 初始化动画
		for (var i in animations) {
			this._animations[i] = animations[i];
		}
	},
	
	_initTimeline: function(animation) {
		var timeline = new Timeline({ loop: true }),
			data, bone, frames, frame;
		// 初始化时间轴	
		for (var j=0, jl=animation.length; j<jl; j++) {
			data = animation[j];
			bone = this._bones[data.tag];
			frames = data.frames;
			timeline.get(bone);
			// 添加关键帧
			for (var i=0, l=frames.length; i<l; i++) {
				frame = frames[i];
				timeline.addKeyframe(frame, frame.time);
			}
		}

		return timeline;
	}
	
});

return SkeletalAnimation;
});

define( 'cartoon',['require','exports','module','base','core/Class','core/Ticker','core/Loader','core/Preload','display/StyleSheet','display/DisplayObject','display/Container','display/Canvas','display/Graphics2D','display/Shape','display/Filter','display/Bitmap','display/Text','animation/Ease','animation/Tween','animation/Timeline','animation/Sprite','extra/ParticleEmitter','extra/ParticleSystem','extra/SkeletalAnimation'],function ( require, exports, module ) {
	
	   
var cartoon = require('base');

cartoon.expand({
	
	// 基础组件
	Class: require('core/Class'),
	Ticker: require('core/Ticker'),
	Loader: require('core/Loader'),
	Preload: require('core/Preload'),
	
	// 渲染组件
	StyleSheet: require('display/StyleSheet'),
	DisplayObject: require('display/DisplayObject'),
	Container: require('display/Container'),
	Canvas: require('display/Canvas'),
	Graphics2D: require('display/Graphics2D'),
	Shape: require('display/Shape'),
	Filter: require('display/Filter'),
	Bitmap: require('display/Bitmap'),
	Text: require('display/Text'),
	
	// 动画组件
	Ease: require('animation/Ease'),
	Tween: require('animation/Tween'),
	Timeline:  require('animation/Timeline'),
	Sprite: require('animation/Sprite'),
	ParticleEmitter: require('extra/ParticleEmitter'),
	ParticleSystem: require('extra/ParticleSystem'),
	SkeletalAnimation: require('extra/SkeletalAnimation')
	
});

return cartoon;
});
