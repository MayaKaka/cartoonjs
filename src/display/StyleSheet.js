
define( function ( require, exports, module ) {

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
		var get = style.get || StyleSheet.commonGet;
		return get.call(target, key);
	}
}

StyleSheet.set = function(target, key, value) {
	var style = StyleSheet.styles[key];
	// 设置样式
	if (style) {
		var set = style.set || StyleSheet.commonSet;
		set.call(target, key, value);
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

StyleSheet.toGradient = function(value) {
	var result;
	if (typeof(value) === 'string') {
		value = value.split(/\,#|\,rgb/);
		// 将渐变样式转换成数组格式
		for (var i = 1, len = value.length; i < len; i++) {
			value[i] = (value[i].indexOf('(')>-1?'rgb':'#') + value[i];
		}
		result = { type: value[0], from: value[1], to: value[2] };
	} else {
		result = value;
	}
	return result;
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
		set: function(key, value) {
			this[key] = value;
			this.style('transform3d', { perspective: value });
		},
		step: StyleSheet.commonStep
	},
	
	width: { // 宽度
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
		set: function(key, value) {
			this[key] = value;		
			if (this.renderMode === 0) {
				this.elemStyle.display = value ? 'block' : 'none';
			}
		}
	},
		
	overflow: { // 溢出效果
		set: function(key, value) {
			this[key] = value;
			if (this.renderMode === 0) {
				this.elemStyle.overflow = value;
			}
		}
	},
	
	alpha: { // 透明度
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
			key = regexpColor.test(value) ? 'fillColor' : 
				  regexpGradient.test(value) ? 'fillGradient' :
				  regexpImage.test(value) ? 'fillImage' : null;
			if (key) {
				StyleSheet.set(this, key, value);
			}
			
		},
		step: function(key, fx) {
			var value = fx.end;
			key = regexpColor.test(value) ? 'fillColor' : 
				  regexpGradient.test(value) ? 'fillGradient' : null;
			if (key) {
				StyleSheet.step(this, key, fx);
			}
		}
	},
	
	fillColor: { // 填充色
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
		set: function(key, value) {
			this.fillColor = this.fillImage = null;
			this[key] = value = StyleSheet.toGradient(value);
			if (this.renderMode === 0) {
				var style = this.elemStyle, text;
				// ie6-8下使用gradient filter
				if (supportIE6Filter || isIE9) {
					var filter = style.filter,
						regexp = /gradient([^)]*)/;
					text = 'gradient(GradientType=0,startColorstr=\''+value.from+'\', endColorstr=\''+value.to+'\'';
					style.filter = regexp.test(filter) ? filter.replace(regexp, text) : (filter + ' progid:DXImageTransform.Microsoft.'+text+')');
				} else {
					// 设置css3样式
					if (value.type === 'center') {
						text = 'radial-gradient(circle,' + value.from + ',' + value.to + ')';
					} else {
						text = 'linear-gradient('+ value.type + ',' + value.from + ',' + value.to +')';
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
				result = { type: end.type };
			// 设置渐变颜色过渡
			result.from = StyleSheet.stepColor(pos, start.from, end.from);
			result.to = StyleSheet.stepColor(pos, start.to, end.to);
			this.style(key, result);
		}
	},
	
	fillImage: { // 填充位图
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
			StyleSheet.set(this, 'strokeColor', value);

		},
		step: function(key, fx) {
			StyleSheet.step(this, 'strokeColor', fx);
		}
	},
	
	strokeColor: { // 画笔颜色
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
		set: function(key, value) {
			this[key] = value;
			if (this.renderMode === 0) {
				this.elemStyle.borderWidth = value + 'px';
			}
		},
		step: StyleSheet.commonStep
	},
	
	radius: { // 圆半径
		set: function(key, value) {
			if (typeof(value) === 'object') {
				for (var i in value) {
					this[key][i] = value[i];
				}
				this.width = this[key].x * 2;
				this.height = this[key].y * 2;
			} else {
				this[key] = value;
				this.width = this.height = value * 2;
			}
			if (this.renderMode === 0) {
				var style = this.elemStyle;
				style.borderRadius = '50%';
				style.width = this.width + 'px';
				style.height = this.height + 'px';
			}
		},
		step: StyleSheet.commonStep
	},
	
	angle: {}, // 圆角度
	
	font: {},  // 字体

	textColor: {}, // 文字颜色
	
	position: {},
	
	rotation: {},
	
	scale: {}
}

return StyleSheet;
});