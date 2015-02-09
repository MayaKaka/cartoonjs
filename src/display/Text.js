
define(function (require) {
	"use strict";

var DisplayObject = require('display/DisplayObject');
	
var Text = DisplayObject.extend({
	
	type: 'Text',

	_text: null,
	
	init: function(props) {
		this._super(props);
		this._initText(props); // 初始化文本
	},
		
	value: function (text) {
		if (text === undefined) {
			return this._text;
		} else {
			this._text = text;
			if (this.renderMode === 0) {
				this.elem.innerHTML = text;
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
		this.color = props.color || '0x000000';
		this.fontSize = props.size || 20;
		this.fontFamily = props.font || 'Microsoft Yahei';
		this.textAlign = props.align || 'left';
		this.textBaseline = props.baseline || 'top';
		
		this.value(props.text || '');
		
		if (this.renderMode === 0) {
			var style = this.elemStyle;
			style.color = this.color;
			style.fontSize = this.fontSize + 'px';
			style.fontFamily = this.fontFamily;
		}
	}

});

return Text;
});