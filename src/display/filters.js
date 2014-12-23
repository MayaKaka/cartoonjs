
define( function ( require, exports, module ) {
	"use strict";
	
var base = require('base'),
	Filter = require('display/Filter'),
	filters = Filter.filters;

base.expend(filters, {
	grayscale: function(image, value) {
		// 处理灰阶效果
		var canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		
		var ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0);
		
		var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
			data = imageData.data,
			pixel;
			
		for (var i=0, l=data.length; i<l; i+=4) {
			pixel = (data[i] + data[i+1] + data[i+2]) / 3;
			data[i] = data[i+1] = data[i+2] = pixel;
		}
	
		ctx.putImageData(imageData, 0, 0);
	
		return canvas;
	},
	
	brightness: function(image, value) {
		// 处理高亮效果
		var canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		
		var ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0);
		
		ctx.globalCompositeOperation = 'lighter';
		ctx.drawImage(image, 0, 0);
		
		return canvas;	
	},
	
	impression: function(image, value) {
		// 处理印象派效果
		var canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		
		var ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0);
		
		var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
			data = imageData.data,
			text = ['1', '0'],
			pixels = [];
			
		for (var i=0, l=data.length; i<l; i+=16) {
			if (Math.floor(i / 4 / canvas.width) % 4) {
				continue;
			}
			pixels.push([
				'rgba('+ data[i] +','+ data[i+1] +','+ data[i+2] +','+ data[i+3] +')', // color
				text[ Math.floor( Math.random() * text.length ) ], // text
				i / 4 % canvas.width, // x
				Math.floor(i / 4 / canvas.width) // y
			]);
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.font = '40px Microsoft Yahei';
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';
		ctx.globalAlpha = 0.25;

		var idx, pixel;
		while (pixels.length) {
			idx = Math.floor(Math.random() * pixels.length);
			pixel = pixels[idx];
			ctx.fillStyle = pixel[0];
			ctx.fillText(pixel[1], pixel[2], pixel[3]);
			pixels.splice(idx, 1);
		}
		
		return canvas;
	},
	
	rilievo: function(image, value) {
		// 处理浮雕效果
		var canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		
		var ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0);
		
		var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
			data = imageData.data,
			next, diff, pixel,
			test = function(val) {
				// 判断是否超出范围
				if (val < 0) {
					val = 0;
				} else if (val > 255) {
					val = 255;
				}
				return val;
			};
			
		for (var i=0, l=data.length; i<l; i+=4) {
			next = i+4;
			if (data[next] === undefined) {
				next = i;
			}
			diff = Math.floor((data[next] + data[next+1] + data[next+2]) - (data[i] + data[i+1] + data[i+2]));
			pixel = test(diff + 128);
			data[i] = data[i+1] = data[i+2] = pixel;
		}
	
		ctx.putImageData(imageData, 0, 0);
	
		return canvas;
	}
});

return filters;
});