
define( function ( require, exports, module ) {
	"use strict";

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