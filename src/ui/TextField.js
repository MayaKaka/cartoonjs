
define(function (require) {
    'use strict';

var DisplayObject = require('display/DisplayObject');
    
var TextField = DisplayObject.extend({
    
    type: 'TextField',

    _htmlText: '<input type="text" />',
    _text: null,
    
    init: function(props) {
        this._super(props);
        this._initText(props); // 初始化文本
    },
        
    value: function (text) {
        if (text === undefined) {
            if (this.renderMode === 0) {
                return this.elem.value;
            } else {
                return this._text;
            }
        } else {
            this._text = text;
            if (this.renderMode === 0) {
                this.elem.value = text;
            }
        }
    },
    
    draw: function(ctx) {
        // 绘制文本
        ctx.font = this.fontSize + 'px ' + this.fontFamily;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        ctx.fillStyle = this.color;
        ctx.fillText(this._text, 0, 0);
    },

    _initText: function(props) {
        // 初始化文本
        this.color = props.color || '#000000';
        this.fontSize = props.size || 20;
        this.fontFamily = props.font || 'Microsoft YaHei';
        this.textAlign = props.align || 'left';
        this.textBaseline = props.baseline || 'top';
        
        this.value(props.value || props.text || '');
        
        if (this.renderMode === 0) {
            var style = this.elemStyle;
            style.padding = '0';
            style.border = 'none';
            style.color = this.color;
            style.fontSize = this.fontSize + 'px';
            style.fontFamily = this.fontFamily;
        }
    }

});

return TextField;
});