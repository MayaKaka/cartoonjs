
define(function (require) {
    'use strict';

var divStyle = document.createElement('div').style,
    prefix = divStyle.webkitTransform === ''? 'webkit' :
             divStyle.WebkitTransform === ''? 'Webkit' :
             divStyle.msTransform === ''? 'ms' :
             divStyle.MozTransform === ''? 'Moz' : 'ct',
    isIE6_8 = prefix === 'ct' && divStyle.filter === '',
    isIE9 = navigator.userAgent.indexOf("MSIE 9.0") > 0;

var match = function(target, key) {
    return target.type === 'Object3D' ? StyleSheet.styles3d[key] : (styles[key] || (target.styles && target.styles[key]));
}

var newStyle = function(prop, name, extra) {
    var style;
    
    if (name) {
        style = {
            get: function(key) { return this[prop][name]; },
            set: function(key, value) { this[prop][name] = value; }
        }
    } else {
        style = {
            get: function(key) { return this[prop]; },
            set: function(key, value) { this[prop] = value; }
        }
    }
    
    style.step = function(key, fx) {
        var pos = fx.pos,
            start = fx.start, 
            end = fx.end;
        if (typeof(end) === 'object') {
            var result = {};
            for (var i in end) {
                result[i] = (end[i] - start[i]) * pos + start[i];
            }
            return result;
        } else {
            return (end - start) * pos + start;
        }
    }

    if (extra) {
        for (var i in extra) {
            style[i] = extra[i];
        }
    }
    
    return style;
}

var init = function(target, key) {
    var style = match(target, key);
    // 初始化样式
    if (style && style.init) {
        return style.init.call(target, key);
    }
}

var get = function(target, key) {
    var style = match(target, key);
    // 获取样式
    if (style) {
        return style.get.call(target, key);
    }
}

var set = function(target, key, value) {
    var style = match(target, key);
    // 设置样式
    if (style) {
        if (style.parse) {
            value = style.parse.call(target, value);
        }
        
        style.set.call(target, key, value);
        
        if (target.renderMode === 0 && style.css) {
            style.css.call(target, key, value);
        }
    }
}

var step = function(target, key, fx) {
    var style = match(target, key);
    // 设置过渡样式
    if (style && style.step) {
        if (style.parse) {
            fx.end = style.parse.call(target, fx.end);
        }
        
        var value = style.step.call(target, key, fx);
        
        if (value !== undefined) {
            set(target, key, value);
        }
    }
}

var css3 = function(style, key, value) {
    // 通用设置css3样式
    var suffix = key.charAt(0).toUpperCase() + key.substring(1, key.length);
    style[prefix+suffix] = value;
};

var toRGBA = function(color){
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

var toColor = function(rgba) {
    var r = rgba.r.toString(16),
        g = rgba.g.toString(16),
        b = rgba.b.toString(16);
    // 将色值转换成16进制格式
    if (r.length===1) r = '0'+r;
    if (g.length===1) g = '0'+g;
    if (b.length===1) b = '0'+b;
    return '#'+r+g+b;
};

var stepColor = function(pos, start, end) {
    start = toRGBA(start);
    end = toRGBA(end);
    // 处理颜色过渡
    var color = {};
    for (var i in end) {
        color[i] = Math.floor((end[i] - start[i]) * pos + start[i]);
        color[i] = color[i] > 255 ? 255 : color[i] < 0 ? 0 : color[i];
    }
    return toColor(color);
}

var styles = {

    x: newStyle('x', null, {
        css: function(key, value) {
            var style = this.elemStyle;
            style.position = 'absolute';
            style.left = value + 'px';
        }
    }),
        
    y: newStyle('y', null, {
        css: function(key, value) {
            var style = this.elemStyle;
            style.position = 'absolute';
            style.top = value + 'px';
        }
    }),
    
    width: newStyle('width', null, {
        css: function(key, value) {
            if (this._useElemSize) {
                this.elem.setAttribute('width', value);
            } else {
                this.elemStyle.width = value + 'px';
            }
        }
    }),
    
    height: newStyle('height', null, {
        css: function(key, value) {
            if (this._useElemSize) {
                this.elem.setAttribute('height', value);
            } else {
                this.elemStyle.height = value + 'px';
            }
        }
    }),
    
    size: newStyle('size', null, {
        get: function(key) {
            return { width: this.width, height: this.height };
        },
        set: function(key, value) {
            if (value.width !== undefined) this.width = value.width;
            if (value.height !== undefined) this.height = value.height;
        },
        css: function(key, value) {
            if (this._useElemSize) {
                var elem = this.elem;
                elem.setAttribute('width', this.width);
                elem.setAttribute('height', this.height);
            } else {
                var style = this.elemStyle;
                style.width = this.width + 'px';
                style.height = this.height + 'px';
            }
        }
    }),
    
    transform: newStyle('transform', null, {
        init: function(key) {
            this.transform = {
                translateX: 0, translateY: 0,
                rotate: 0,
                scale: 1, scaleX: 1, scaleY: 1,
                skewX: 0, skewY: 0,
                originX: 0.5, originY: 0.5
            };
            return this.transform;
        },
        get: function(key) {
            return this.transform || init(this, key);
        },
        set: function(key, value) {
            get(this, key);
            for (var i in value) {
                this._updateTransform(i, value[i]);
            }
        },
        css: function(key, value) {
            var style = this.elemStyle,
                t2d = this.transform;
            if (isIE6_8) {
                style.marginLeft = t2d.translateX + 'px';
                style.marginTop  = t2d.translateY + 'px';
            } else {
                // 设置css3样式
                css3(style, 'transform', this._mergeTransformText());
                if ('originX' in value || 'originY' in value) {
                    css3(style, 'transformOrigin', t2d.originX*100+'% ' + t2d.originY*100+'%');
                }
            }
        }
    }),
    
    transform3d: newStyle('transform3d', null, {
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
                css3(style, 'transformStyle', 'preserve-3d');
                css3(style, 'backfaceVisibility', 'visible');
            }
            return this.transform3d;
        },
        get: function(key){
            return this.transform3d || init(this, key);
        },
        set: function(key, value) {
            get(this, key);
            for (var i in value) {
                this._updateTransform3D(i, value[i]);
            }
        },
        css: function(key, value) {
            var style = this.elemStyle,
                t3d = this.transform3d;
            css3(style, 'transform', this._mergeTransform3DText());
            if ('originX' in value || 'originY' in value || 'originZ' in value) {   
                css3(style, 'transformOrigin', t3d.originX*100+'% ' + t3d.originY*100+'%');
            }
        }
    }),
    
    visible: newStyle('visible', null, {
        css: function(key, value) {
            this.elemStyle.display = value ? 'block' : 'none';
        }
    }),
    
    overflow: newStyle('overflow', null, {
        css: function(key, value) {
            this.elemStyle.overflow = value;
        }
    }),
    
    alpha: newStyle('alpha', null, {
        parse: function(value) {
            return value >= 0 ? value : 0;
        },
        css: function(key, value) {
            var style = this.elemStyle;
            if (isIE6_8) {
                var filter = style.filter,
                    regexp = /alpha\(opacity=([^)]*)/,
                    text = 'alpha(opacity=' + value*100;
                style.filter = regexp.test(filter) ? filter.replace(regexp, text) : (filter + ' '+ text + ')');    
            } else {
                // 设置css3样式
                style.opacity = value;
            }
        }
    }),
    
    shadow: newStyle('shadow', null, {
        parse: function(value) {
            if (typeof(value) === 'string') {
                value = value.split('px ');
                value = {
                    offsetX: parseFloat(value[0]),
                    offsetY: parseFloat(value[1]),
                    blur: parseFloat(value[2]),
                    color: value[3]
                }
            }
            return value;
        },
        css: function(key, value) {
            var shadow = this.shadow,
                stlyeName = this.type === 'Text' ? 'textShadow' : 'boxShadow';
            this.elemStyle[stlyeName] = shadow.color ? (shadow.offsetX+'px ' + shadow.offsetY+'px ' + shadow.blur+'px ' + shadow.color) : '';
        }
    })

};

var StyleSheet = {

    isIE6_8: isIE6_8,
    isIE9: isIE9,
    newStyle: newStyle,
    styles: styles,
    init: init,
    get: get,
    set: set,
    step: step,
    stepColor: stepColor

}

return StyleSheet;
});