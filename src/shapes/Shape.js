
define(function (require) {
    'use strict';

var Preload = require('core/Preload'),
    DisplayObject = require('display/DisplayObject'),
    Graphics2D = require('display/Graphics2D'),
    StyleSheet = require('display/StyleSheet');

var newStyle = StyleSheet.newStyle,
    regexpColor = /^\#|^rgb|^rgba|black|red|green|blue|yellow|orange|pink|purple|gray/,
    regexpGradient = /^top|^right|^bottom|^left|^center/,
    regexpImage = /\.jpg$|\.png$|\.gif$/;

var styles = {
    fill: newStyle('fill', null, {
        get: function(key) {
            return this.fillColor || this.fillGradient || this.fillImage;
        },
        set: function(key, value) {
            this[key] = value;
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
    }),
    
    fillColor: newStyle('fillColor', null, {
        set: function(key, value) {
            this[key] = value;
            this.fillBrush = this.fillGradient = this.fillImage = null;
        },
        css: function(key, value) {
            if (this._useSVG) {
                if (this.svg) {
                    this.svg.setAttribute('fill', value);
                }
            } else {
                this.elemStyle.backgroundColor = value;
                this.elemStyle.backgroundImage = '';
            }
        },
        step: function(key, fx) {
            return StyleSheet.stepColor(fx.pos, fx.start, fx.end);
        }
    }),
    
    fillGradient: newStyle('fillGradient', null, {
        parse: function(value) {
            if (typeof(value) === 'string') {
                value = value.split(/\,#|\,rgb/);
                // 将渐变样式转换成数组格式
                for (var i = 1, len = value.length; i < len; i++) {
                    value[i] = (value[i].indexOf('(')>-1?'rgb':'#') + value[i];
                }
                value = { type: value[0], from: value[1], to: value[2] };
            }
            return value;
        },
        set: function(key, value) {
            this[key] = value;
            this.fillBrush = this.fillColor = this.fillImage = null;
        },
        css: function(key, value) {
            var style = this.elemStyle, text;
            // ie6-8下使用gradient filter
            if (StyleSheet.isIE6_8 || StyleSheet.isIE9) {
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
        },
        step: function(key, fx) {
            var start = fx.start,
                end = fx.end,
                pos = fx.pos,
                result = { type: end.type };
            // 设置渐变颜色过渡
            result.from = StyleSheet.stepColor(pos, start.from, end.from);
            result.to = StyleSheet.stepColor(pos, start.to, end.to);
            return result;
        }
    }),

    fillImage: newStyle('fillImage', null, {
        parse: function(value) {
            if (this.renderMode === 1) {
                if (!Preload.has(value)) { // 初始化image
                    Preload.load({ type: 'image', url: value });
                }
                value = Preload.get(value);
            }
            return value;
        },
        set: function(key, value) {
            this[key] = value;
            this.fillBrush = this.fillColor = this.fillGradient = null;  
        },
        css: function(key, value) {
            this.elemStyle.backgroundImage = 'url(' + Preload.getUrl(value) + ')';
        },
        step: null
    }),
    
    stroke: newStyle('stroke', null, {
        get: function(key) {
            return this.strokeColor;
        },
        set: function(key, value) {
            this[key] = value;
            StyleSheet.set(this, 'strokeColor', value);

        },
        step: function(key, fx) {
            StyleSheet.step(this, 'strokeColor', fx);
        }
    }),
    
    strokeColor: newStyle('strokeColor', null, {
        css: function(key, value) {
            if (this._useSVG) {
                if (this.svg) {
                    this.svg.setAttribute('stroke', value);
                }
            } else {
                var style = this.elemStyle;
                style.borderColor = value ? value : '';
                style.borderStyle = value ? 'solid' : 'none';
            }
        },
        step: function(key, fx) {
            return StyleSheet.stepColor(fx.pos, fx.start, fx.end);
        }
    }),
    
    strokeWidth: newStyle('strokeWidth', null, {
        css: function(key, value) {
            if (this._useSVG) {
                if (this.svg) {
                    this.svg.setAttribute('stroke-width', value);
                }
            } else {
                this.elemStyle.borderWidth = value + 'px';
            }
            
        }
    }),
    
    radius: newStyle('radius', null, {
        set: function(key, value) {
            this[key] = value;
            var size = value*2;
            StyleSheet.set(this, 'size', { width: size, height: size });
        },
        css: function(key, value) {
            var style = this.elemStyle;
            style.borderRadius = '50%';
        }
    }),
    
    radiusX: newStyle('radius', null, {
        set: function(key, value) {
            this[key] = value;
            var width = value*2;
            StyleSheet.set(this, 'width', width);
        },
        css: function(key, value) {
            var style = this.elemStyle;
            style.borderRadius = '50%';
        }
    }),

    radiusY: newStyle('radius', null, {
        set: function(key, value) {
            this[key] = value;
            var height = value*2;
            StyleSheet.set(this, 'height', height);
        },
        css: function(key, value) {
            var style = this.elemStyle;
            style.borderRadius = '50%';
        }
    }),

    angle: newStyle('angle', null, {
        css: function(key, value) {
            var radius = this.radius;
            value = 'M' + radius +' 0A'+ radius + ' ' + radius + ' 0 0 1 ' + radius*2 + ' ' + radius*2;
            this.svg.setAttribute('d', value);
        }
    }), // 圆角度

    path: newStyle('path', null, {
        set: function(key, value) {
            this[key] = value;
            var pt, w, h, 
                maxW = this.width, 
                maxH = this.height;
            for (var i=0, l=value.length; i<l; i++) {
                pt = value[i];
                w = pt[pt.length-2];
                h = pt[pt.length-1];
                if (maxW < w) maxW = w;
                if (maxH < h) maxH = h;
            }
            StyleSheet.set(this, 'size', { width: maxW, height: maxH });
        },
        css: function(key, value) {
            if (this._useSVG) {
                if (this.svg) {
                    var path = value,
                        value = '',
                        section;
                    for (var i=0, l=path.length; i<l; i++) {
                        section = path[i];
                        if (i === 0 || section[2] === true) {
                            value += 'M' + section[0] + ' ' + section[1];
                        } else {
                            if (section.length === 6) {
                                value += 'C' + section[0] + ' ' + section[1] + ' ' + section[2] + ' ' + section[3] + ' ' + section[4] + ' ' + section[5]; 
                            } else if (section.length === 4) {
                                value += 'C' + section[0] + ' ' + section[1] + ' ' + section[2] + ' ' + section[3];
                            } else {
                                value += 'L' + section[0] + ' ' + section[1];
                            }
                            // todo arc mode
                        }
                    }
                    if (this.type === 'Ploygon') {
                        value += 'Z';
                    }
                    this.svg.setAttribute('d', value);
                }
            }
        }
    })
};

var Shape = DisplayObject.extend({

    type: 'Shape',
    
    styles: styles,
    graphics: null,
    snapToPixel: true,

    init: function(props) {
        this._super(props);
        this._initGraphics(props); // 初始化图形
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
                if (this.fillBrush) {
                    style = this.fillBrush;
                } else {
                    this.fillBrush = style = ctx.createPattern(image, 'no-repeat');
                }
            }
        } else if (gradient) {
            if (this.fillBrush) {
                style = this.fillBrush;
            } else {
                // 使用渐变填充
                switch (gradient.type) {
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
                style.addColorStop(0.0, gradient.from);
                style.addColorStop(1.0, gradient.to);
                this.fillBrush = style;
            }
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
            strokeWidth = this.strokeWidth;
        // 设置strokeStyle
        if (style && strokeWidth) {
            ctx.strokeStyle = style;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = this.lineCap || 'round';
            ctx.lineJoin = this.lineJoin || 'round';
            // 解决画线模糊的问题
            if (this.snapToPixel && strokeWidth === 1) {
                var mtx = this._matrix2d;
                ctx.translate(mtx.tx>=0 ? 0.5 : -0.5, mtx.ty>=0 ? 0.5 : -0.5);
            }
            return true;
        }
        return false;
    },
        
    _initGraphics: function(props) {
        var graphics = props.graphics || props.g;

        if (graphics) {
            var type = graphics.type,
                g = type ? Graphics2D.get(type) : graphics;
            // 初始化2d图形
            if (g && g.init && g.draw) {
                this.graphics = g;
                this._useSVG = this.renderMode === 0 && g.svg;
                
                g.init.call(this, graphics);
                
                if (this._useSVG) {
                    g.svg.call(this);
                }
            }
        }
    }
    
});

return Shape;
});