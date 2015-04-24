
define(function (require) {
    'use strict';

var base = require('base'),
    DisplayObject = require('display/DisplayObject');
    
var Stage = DisplayObject.extend({

    type: 'Stage',
    
    autoUpdate: true,
    
    init: function(props) {
        props.render = 0;
        this._super(props);
        this._initEvents(); // 初始化鼠标及触摸事件
    },
    
    update: function (delta) {
        if (this.autoUpdate) {
            this._eachUpdaters(delta);
        }
    },
    
    _initEvents: function(props) {
        var self = this,
            elem = this.elem,
            mouseX, mouseY,
            target, moved,
            startX, startY;
        // 事件处理函数
        var preventDef = function(evt) {
            var tag = (evt.target || evt.srcElement).tagName.toLowerCase();
            if (tag === 'a' || tag === 'input' || tag === 'select' || tag === 'textarea' || tag === 'embed') {
                return;
            }
            if (evt.preventDefault) {
                evt.preventDefault();
            } else {
                window.event.returnValue = false;
            }
        }
        var handleDown = function(evt) {
            preventDef(evt);
            mouseX = self._getMouseX(evt);
            mouseY = self._getMouseY(evt);
            // 检测点击对象
            target = self._hitTest(evt.target || evt.srcElement) || self;
            // 触发down事件
            self._triggerEvent('mousedown', target, mouseX, mouseY);
            // 标记起始状态
            moved = false;
            startX = mouseX;
            startY = mouseY;
        };
        var    handleUp = function(evt) {
            preventDef(evt);
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
            preventDef(evt);
            mouseX = self._getMouseX(evt);
            mouseY = self._getMouseY(evt);
            // 触发move事件
            self._triggerEvent('mousemove', target || self, mouseX, mouseY);
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
            if (elem.attachEvent) {
                elem.attachEvent('onmousedown', handleDown, false);
                elem.attachEvent('onmouseup', handleUp, false);
                elem.attachEvent('onmousemove', handleMove, false);
            } else {
                elem.addEventListener('mousedown', handleDown, false);
                elem.addEventListener('mouseup', handleUp, false);
                elem.addEventListener('mousemove', handleMove, false);
            }
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
    
return Stage;
});