
define( function ( require, exports, module ) {
	"use strict";
	
var	base = require('base'),
	Class = require('core/Class');

var DEG_TO_RAD = base.DEG_TO_RAD;

// 2D矩阵，参见 https://github.com/CreateJS/EaselJS/blob/master/src/easeljs/geom/Matrix2D.js
var Matrix2D = Class.extend({
	
	a: 1,
	b: 0,
	c: 0,
	d: 1,
	tx: 0,
	ty: 0,
	
	prepend: function(a, b, c, d, tx, ty) {
		var tx1 = this.tx;
		if (a != 1 || b != 0 || c != 0 || d != 1) {
			var a1 = this.a;
			var c1 = this.c;
			this.a  = a1*a+this.b*c;
			this.b  = a1*b+this.b*d;
			this.c  = c1*a+this.d*c;
			this.d  = c1*b+this.d*d;
		}
		this.tx = tx1*a+this.ty*c+tx;
		this.ty = tx1*b+this.ty*d+ty;
		return this;
	},
	
	append: function(a, b, c, d, tx, ty) {
		var a1 = this.a;
		var b1 = this.b;
		var c1 = this.c;
		var d1 = this.d;

		this.a  = a*a1+b*c1;
		this.b  = a*b1+b*d1;
		this.c  = c*a1+d*c1;
		this.d  = c*b1+d*d1;
		this.tx = tx*a1+ty*c1+this.tx;
		this.ty = tx*b1+ty*d1+this.ty;
		return this;
	},
	
	prependMatrix: function(matrix) {
		this.prepend(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
		return this;
	},
	
	appendMatrix: function(matrix) {
		this.append(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
		return this;
	},
	
	prependTransform: function(x, y, scaleX, scaleY, rotation, skewX, skewY) {
		if (rotation%360) {
			var r = rotation*DEG_TO_RAD;
			var cos = Math.cos(r);
			var sin = Math.sin(r);
		} else {
			cos = 1;
			sin = 0;
		}

		if (skewX || skewY) {
			// TODO: can this be combined into a single prepend operation?
			skewX *= DEG_TO_RAD;
			skewY *= DEG_TO_RAD;
			this.prepend(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, 0, 0);
			this.prepend(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
		} else {
			this.prepend(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, x, y);
		}
		return this;
	},
	
	appendTransform: function(x, y, scaleX, scaleY, rotation, skewX, skewY) {
		if (rotation%360) {
			var r = rotation*DEG_TO_RAD;
			var cos = Math.cos(r);
			var sin = Math.sin(r);
		} else {
			cos = 1;
			sin = 0;
		}

		if (skewX || skewY) {
			// TODO: can this be combined into a single append?
			skewX *= DEG_TO_RAD;
			skewY *= DEG_TO_RAD;
			this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
			this.append(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, 0, 0);
		} else {
			this.append(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, x, y);
		}
		return this;
	},
	
	rotate: function(angle) {
		var cos = Math.cos(angle);
		var sin = Math.sin(angle);

		var a1 = this.a;
		var c1 = this.c;
		var tx1 = this.tx;

		this.a = a1*cos-this.b*sin;
		this.b = a1*sin+this.b*cos;
		this.c = c1*cos-this.d*sin;
		this.d = c1*sin+this.d*cos;
		this.tx = tx1*cos-this.ty*sin;
		this.ty = tx1*sin+this.ty*cos;
		return this;
	},
	
	skew: function(skewX, skewY) {
		skewX = skewX*DEG_TO_RAD;
		skewY = skewY*DEG_TO_RAD;
		this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), 0, 0);
		return this;
	},
	
	scale: function(x, y) {
		this.a *= x;
		this.d *= y;
		this.c *= x;
		this.b *= y;
		this.tx *= x;
		this.ty *= y;
		return this;
	},
	
	translate: function(x, y) {
		this.tx += x;
		this.ty += y;
		return this;
	},
	
	identity: function() {
		this.a = this.d = 1;
		this.b = this.c = this.tx = this.ty = 0;
		return this;
	},
	
	invert: function() {
		var a1 = this.a;
		var b1 = this.b;
		var c1 = this.c;
		var d1 = this.d;
		var tx1 = this.tx;
		var n = a1*d1-b1*c1;

		this.a = d1/n;
		this.b = -b1/n;
		this.c = -c1/n;
		this.d = a1/n;
		this.tx = (c1*this.ty-d1*tx1)/n;
		this.ty = -(a1*this.ty-b1*tx1)/n;
		return this;
	},
	
	isIdentity: function() {
		return this.tx == 0 && this.ty == 0 && this.a == 1 && this.b == 0 && this.c == 0 && this.d == 1;
	},
	
	transformPoint: function(x, y, pt) {
		pt = pt||{};
		pt.x = x*this.a+y*this.c+this.tx;
		pt.y = x*this.b+y*this.d+this.ty;
		return pt;
	}
	
});

return Matrix2D;
});