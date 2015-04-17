
define(function (require) {
    'use strict';

var Graphics2D = function() {};

Graphics2D.get = function(type) {
    // 获取2d图形
    return Graphics2D.shapes[type];
}

var setStyle = function(target, data) {
    if (data.stroke && data.strokeWidth === undefined) {
        data.strokeWidth = 1;
    }
    // 设置绘图样式
    target.style('fill', data.fill);
    target.style('stroke', data.stroke);
    target.style('strokeWidth', data.strokeWidth);
}

var drawShape = function(ctx, hasFill, hasStroke) {
    // 绘制图形
    if (hasFill) ctx.fill();
    if (hasStroke) ctx.stroke();
}

Graphics2D.shapes = {
    rect: {
        init: function(data) {
            this.style('size', data);
            // 设置通用样式
            setStyle(this, data);
        },
        draw: function(ctx) {
            
        }
    },
    
    circle: {
        init: function(data) {
            this.style('radius', data.radius);
            // 设置通用样式
            setStyle(this, data);
        },
        draw: function(ctx) {
            var radius = this.radius,
                hasFill = this.setFill(ctx),
                hasStroke = this.setStroke(ctx);
            // 绘制圆
            ctx.beginPath();
            ctx.arc(radius, radius, radius, 0, Math.PI*2, 0);
            ctx.closePath();
            drawShape(ctx, hasFill, hasStroke);
        }
    },
    
    ellipse: {
        init: function(data) {
            this.style({
                'radiusX': data.radiusX,
                'radiusY': data.radiusY
            });
            // 设置通用样式
            setStyle(this, data);
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
            drawShape(ctx, hasFill, hasStroke);
        }
    },
    
    line: {
        init: function(data) {

            this.style('path', data.path);
            // 设置通用样式
            setStyle(this, data);
        },
        draw: function(ctx) {
            var path = this.path, section, 
                hasStroke = this.setStroke(ctx);
            // 绘制线段
            if (hasStroke && path.length > 1) {
                ctx.beginPath();
                for (var i=0, l=path.length; i<l; i++) {
                    section = path[i];
                    if (i === 0 || section[2] === true) {
                        ctx.moveTo(section[0], section[1]);
                    } else {
                        if (section.length === 6) {
                            ctx.bezierCurveTo(section[0], section[1], section[2], section[3], section[4], section[5]);        
                        } else if (section.length === 4) {
                            ctx.quadraticCurveTo(section[0], section[1], section[2], section[3]);        
                        } else {
                            ctx.lineTo(section[0], section[1]);
                        }
                    }
                }
                ctx.stroke();
            }
        },
        svg: function() {
            var path = this.path,
                d = '',
                section;

            if (path.length > 1) {
                for (var i=0, l=path.length; i<l; i++) {
                    section = path[i];
                    if (i === 0 || section[2] === true) {
                        d += 'M' + section[0] + ' ' + section[1];
                    } else {
                        if (section.length === 6) {
                            d += 'C' + section[0] + ' ' + section[1] + ' ' + section[2] + ' ' + section[3] + ' ' + section[4] + ' ' + section[5]; 
                        } else if (section.length === 4) {
                            d += 'C' + section[0] + ' ' + section[1] + ' ' + section[2] + ' ' + section[3];
                        } else {
                            d += 'L' + section[0] + ' ' + section[1];
                        }
                    }
                }
            }

            this.elemStyle.lineHeight = 0;
            this.elem.innerHTML = '<svg width="'+this.width+'" height="'+this.height+'" version="1.1" xmlns="http://www.w3.org/2000/svg">\
                    <path fill="none" stroke="'+this.strokeColor+'" stroke-width="'+this.strokeWidth+'" d="'+d+'"></path>\
                </svg>';
            console.log(this.elem.children);
            this.svg = this.elem.children[0].children[0];
        }
    },
    
    ring: {

    },

    ploygon: {
        init: function(data) {
            this.style('path', data.path);
            // 设置通用样式
            setStyle(this, data);
        },
        draw: function(ctx) {
            var path = this.path, section,
                hasFill = this.setFill(ctx),
                hasStroke = this.setStroke(ctx);
            // 绘制多边形
            if (path.length > 2) {
                ctx.beginPath();
                for (var i=0, l=path.length; i<l; i++) {
                    section = path[i];
                    if (i === 0) {
                        ctx.moveTo(section[0], section[1]);
                    } else {
                        if (section.length === 6) {
                            ctx.bezierCurveTo(section[0], section[1], section[2], section[3], section[4], section[5]);        
                        } else if (section.length === 4) {
                            ctx.quadraticCurveTo(section[0], section[1], section[2], section[3]);        
                        } else {
                            ctx.lineTo(section[0], section[1]);
                        }
                    }
                }
                ctx.closePath();
                drawShape(ctx, hasFill, hasStroke);
            }
        },
        svg: function() {
            var path = this.path,
                p = '',
                section;

            if (path.length > 2) {
                for (var i=0, l=path.length; i<l; i++) {
                    section = path[i];
                    p += section[0] + ',' + section[1] + ' ';
                }
            }

            var fill = this.fillColor || 'none',
                stroke = this.strokeColor || 'none';

            this.elemStyle.lineHeight = 0;
            this.elem.innerHTML = '<svg width="'+this.width+'" height="'+this.height+'" version="1.1" xmlns="http://www.w3.org/2000/svg">\
                    <polygon fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+this.strokeWidth+'" points="'+p+'"></polygon>\
                </svg>';

            this.svg = this.elem.children[0].children[0];
        }
    },
    
    polyStar: {
        init: function(data) {
            this.sides = data.sides || 5;
            this.cohesion = data.cohesion || 0.6;
            this.style('radius', data.radius);
            // 设置通用样式
            setStyle(this, data);
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
            drawShape(ctx, hasFill, hasStroke);
        }
    }
}

return Graphics2D;
});