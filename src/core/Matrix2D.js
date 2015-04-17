
define(function (require) {
    'use strict';

var Class = require('core/Class');

var DEG_TO_RAD = Math.PI/180;

// 2D矩阵，参见 https://github.com/CreateJS/EaselJS/blob/master/src/easeljs/geom/Matrix2D.js
var Matrix2D = Class.extend({
    
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    tx: 0,
    ty: 0,
    
    append: function(a, b, c, d, tx, ty) {
        var a1 = this.a;
        var b1 = this.b;
        var c1 = this.c;
        var d1 = this.d;
        var x1 = this.tx;
        var y1 = this.ty;

        this.a  = a*a1 + b*c1;
        this.b  = a*b1 + b*d1;
        this.c  = c*a1 + d*c1;
        this.d  = c*b1 + d*d1;
        this.tx = tx*a1 + ty*c1 + x1;
        this.ty = tx*b1 + ty*d1 + y1;
        return this;
    },
    
    appendMatrix: function(matrix) {
        this.append(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
        return this;
    },
    
    appendTransform: function(x, y, scaleX, scaleY, rotation, skewX, skewY) {
        var r, cos, sin;

        if (rotation%360) {
            r = rotation*DEG_TO_RAD;
            cos = Math.cos(r);
            sin = Math.sin(r);
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
    }
    
});

return Matrix2D;
});