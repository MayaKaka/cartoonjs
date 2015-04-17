
define(function (require) {
    'use strict';

var Shape = require('shapes/Shape');
    
var Ring = Shape.extend({

    type: 'Ring',

    _htmlText: '<svg width="0" height="0" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>',
    _useSVG: true,
    _useElemSize: true,

    draw: function(ctx) {
        var radius = this.radius,
            angle = this.angle,
            rate = angle / 360,
            hasStroke = this.setStroke(ctx);
        // 绘制圆
        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, rate*Math.PI*2, 0);
        hasStroke && ctx.stroke();
    },

    _initGraphics: function(props) {
        if (this.renderMode === 0) {
            this.svg = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.elem.appendChild(this.svg);
        }
        this.style({
            stroke: props.stroke,
            strokeWidth: props.strokeWidth || 1,
            radius: props.radius,
            angle: props.angle
        });
    }

});

return Ring;
});