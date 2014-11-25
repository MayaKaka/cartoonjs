
define( function ( require, exports, module ) {
	"use strict";
	   
var DisplayObject = require('display/DisplayObject'),
	Graphics2D = require('display/Graphics2D');
	
var Shape = DisplayObject.extend({

	type: 'Shape',
	
	graphics: null,
	snapToPixel: true,
	
	init: function(props) {
		this._super(props);
		this._initGraphics(props.graphics || props.g); // 初始化图形
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