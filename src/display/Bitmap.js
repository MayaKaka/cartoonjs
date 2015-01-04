
define( function ( require, exports, module ) {
	"use strict";

var DisplayObject = require('display/DisplayObject'),
	Preload = require('core/Preload'),
	Filter = require('display/Filter');

var supportCanvas = !!document.createElement('canvas').getContext,
	divStyle = document.createElement('div').style,
	prefix = divStyle.webkitTransform === ''? 'webkit' :
    		 divStyle.WebkitTransform === ''? 'Webkit' :
    		 divStyle.msTransform === ''? 'ms' :
    		 divStyle.MozTransform === ''? 'Moz' : 'ct';

var Bitmap = DisplayObject.extend({
	
	type: 'Bitmap',

	_image: null,
	_srcRect: null,
	_srcCanvas: null,
	_scaleToFit: false,
	
	init: function(props) {
		this._super(props);
		this._initImage(props); // 初始化图像资源
	},

	draw: function(ctx) {
		if (this._image.complete) {
			var image = this._srcCanvas || this._image;

			if (this._srcRect) { // 处理剪裁
				ctx.drawImage(image, this._srcRect.x, this._srcRect.y, this.width, this.height, 0, 0, this.width, this.height);
			} 
			else if (this._scaleToFit) { // 处理平铺
				ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, this.width, this.height);
			} 
			else { // 绘制image
				ctx.drawImage(image, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
			}
		}
	},
	
	source: function(image, rect) {
		if (image === undefined) {
			return this._srcCanvas || this._image;
		} else {
			if (image instanceof Array) {
				this._initImage({ rect: image });
			} else {
				this._initImage({ image: image, rect: rect });
			}
		}
	},

	apply: function(type, value) {
		if (this.renderMode === 0) { // dom方式添加滤镜
			this.elemStyle[prefix + 'Filter'] = type ? (type + '(' + value + ')') : '';
		} 
		else if (this.renderMode === 1) { // canvas方式添加滤镜
			var image = this._image;
			
			if (image.complete) {
				this._srcCanvas = (type && supportCanvas) ? Filter.get(image, type, value) : null;
			} 
			else {
				var self = this;
				// 兼容低版本ie		
				if (!image.addEventListener) {
					image.addEventListener = image.attachEvent;
				}
				// 加载完成后执行
				image.addEventListener('load', function() {
					self.applyFilter(type, value);
				});
			}
		}	
	},
	
	_initImage: function(props) {
		var image = props.image,
			rect = props.rect || props.sourceRect,
			fit = !!props.scaleToFit,
			style = this.elemStyle;

		if (rect) { // 剪裁
			this._srcRect = { x: rect[0], y: rect[1] };
			this.style('size', { width: rect[2], height: rect[3] });
			if (this.renderMode === 0) {
				style.backgroundPosition = '-' + this._srcRect.x + 'px -' + this._srcRect.y + 'px';
			}
		}
		else if (fit)  { // 平铺
			this._scaleToFit = fit;
			if (this.renderMode === 0) {
				style.backgroundSize = '100% 100%';
			}
		}
		
		if (image) {
			this._image = image;

			if (this.renderMode === 0) { // dom方式渲染
				style.backgroundImage = 'url('+image+')';	
				style.backgroundRepeat = 'no-repeat';
			}
			else if (this.renderMode === 1) { // canvas方式渲染
				if (typeof(image) === 'string') {
					if (!Preload.hasItem(image)) { // 初始化image
						Preload.loadFile({ type: 'image', url: image });
					}
					this._image = Preload.getItem(image);
				}
			}
		}
	}
	
});
	
return Bitmap;
});