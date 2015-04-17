
define(function (require) {
    'use strict';

var Shape = require('shapes/Shape');
    
var Circle = Shape.extend({

    type: 'Circle',

    draw: function(ctx) {
        var radius = this.radius,
            hasFill = this.setFill(ctx),
            hasStroke = this.setStroke(ctx);
        // 绘制圆
        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, Math.PI*2, 0);
        ctx.closePath();
        hasFill && ctx.fill();
        hasStroke && ctx.stroke();
    },

    _initGraphics: function(props) {
        this.style({
            fill: props.fill,
            stroke: props.stroke,
            strokeWidth: props.strokeWidth || 1,
            radius: props.radius
        });
    }

});

return Circle;
});