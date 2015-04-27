
define(function (require) {
    'use strict';

var Matrix2D = require('core/Matrix2D'),
    DisplayObject = require('display/DisplayObject');
    
var Canvas = DisplayObject.extend({
    
    type: 'Canvas',
    
    autoUpdate: true,
    
    _htmlText: '<canvas></canvas>',
    _context2d: null,
    _useElemSize: true,

    init: function(props) {
        props.render = 0;
        this._super(props);
        this._initEvents(); // 初始化鼠标及触摸事件
        this._context2d = this.elem.getContext('2d'); // 获取2d上下文

        this._initPixelCanvas(); // 用于像素检测
    },

    clear: function() {
        this._context2d.clearRect(0, 0, this.width, this.height);
    },

    update: function(delta) {
        if (this.autoUpdate) {
            this._eachUpdaters(delta);
        }
            
        var ctx = this._context2d;
        // 重绘画布
        this.clear();
        this.draw(ctx);
    },
    
    getData: function() {
        var data = this._context2d.getImageData(0, 0, this.width, this.height).data,
            result = [],
            index;

        for (var j = 0; j < height; j++) {
            result[j] = [];
            for (var i = 0; i < width; i++) {
                index = width*4*j + i*4;
                if (data[i+3] === 0) {
                    result[j][i] = null;
                } else {
                    result[j][i] = [data[i], data[i+1], data[i+2], data[i+3]];    
                }
            }
        }

        return result;
    },

    _initEvents: function() {
        var self = this,
            elem = this.elem,
            mouseX, mouseY,
            result, moved,
            startX, startY;
        // 事件处理函数
        var handleDown = function(evt) {
            evt.preventDefault();
            mouseX = self._getMouseX(evt);
            mouseY = self._getMouseY(evt);
            // 检测点击对象
            result = self._hitTest(self.children, mouseX, mouseY, true);
            // 触发down事件
            self._triggerEvent('mousedown', result);
            // 标记起始状态
            moved = false;
            startX = mouseX;
            startY = mouseY;
        };
        var handleUp = function(evt) {
            evt.preventDefault();
            // 触发up事件
            self._triggerEvent('mouseup', result);
            // 触发click事件
            if (!moved) {
                self._triggerEvent('click', result);
            }
            // 清除对象
            result = null;
        };
        var handleMove = function(evt) {
            evt.preventDefault();
            mouseX = self._getMouseX(evt);
            mouseY = self._getMouseY(evt);
            
            if (result) {
                result.mouseX = mouseX;
                result.mouseY = mouseY;
            }
            // 触发move事件
            self._triggerEvent('mousemove', result || { target: self, mouseX: mouseX, mouseY: mouseY });
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
        }
        if ('onmousedown' in window) {
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
    
    _triggerEvent: function(eventName, result) {
        if (result) {
            var target = result.target;

            result.type = eventName;
            result.srcTarget = target;

            // 事件冒泡执行
            while (target) {
                target.trigger(result);
                target = target.parent;
            }
        }
    },
    
    _hitTest: function(children, mouseX, mouseY, isRoot) {
        var child, result;
        // 遍历检测点击对象
        for (var i=children.length-1; i>=0; i--) {
            child = children[i];
            // 容器节点，递归检测
            if (child.children.length) {
                result = this._hitTest(child.children, mouseX, mouseY);
                if (result) {
                    return result;
                }
            }
            // 检测矩阵
            if (child.width && child.height) {
                result = this._hitTestMatrix(child, mouseX, mouseY);
                if (result) {
                     return result;
                }
            }
        }
        
        if (isRoot) {
            return {
                target: this,
                offsetX: mouseX,
                offsetY: mouseY,
                mouseX: mouseX,
                mouseY: mouseY
            };
        } else {
            return null;
        }
        
    },
    
    _hitTestMatrix: function(child, mouseX, mouseY) {
        // 不可见或者不可点击时跳过检测
        if (!child.visible || !child.mouseEnabled) return false;
        // 执行检测
        var matrix = new Matrix2D(),
            objs = [],
            obj = child,
            dx, dy, mtx;
        // 依次加入层节点
        while (obj && obj !== this) {
            objs.unshift(obj);
            obj = obj.parent;
        }
        // 运算鼠标偏移量
        matrix.append(1, 0, 0, 1, -mouseX, -mouseY);
        // 矩阵运算
        for (var i=0, l=objs.length; i<l; i++) {
            obj = objs[i];
            mtx = obj._matrix2d;
            dx = obj._getAnchorX();
            dy = obj._getAnchorY();
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
        var hit = false,
            x = matrix.tx, 
            y = matrix.ty,
            r = child.radius,
            w = child.width,
            h = child.height,
            pixel = this._pixelContext,
            hitPixel = child.pixelHitTest,
            pixelData;

        if (hitPixel) {
            pixel.setTransform(1, 0, 0, 1, 0, 0);
            pixel.clearRect(0, 0, 1, 1);
            pixel.setTransform(1, 0, 0, 1, -x, -y);
            child.draw(pixel);
            pixelData = pixel.getImageData(0, 0, 1, 1).data;
            if (pixelData[0] || pixelData[1] || pixelData[2] || pixelData[3]) {
                hit = true;
            }
        } else if (r) {
            if (r*r >= (x-r)*(x-r) + (y-r)*(y-r)) {
                hit = true;
            }
        }
        else if (w && h) {
            if (x >= 0 && x <= w && y >= 0 && y <= h) {
                hit = true;
            }
        }
        
        if (hit) {
            return { 
                target: child,
                offsetX: x,
                offsetY: y,
                mouseX: mouseX,
                mouseY: mouseY
            }
        } else {
            return null;
        }
    },

    _initPixelCanvas: function() {
        var canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;

        this._pixelContext = canvas.getContext('2d');
    }
    
});
    
return Canvas;
});