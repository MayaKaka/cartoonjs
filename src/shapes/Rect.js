
define(function (require) {
    'use strict';

var Shape = require('shapes/Shape');
    
var Rect = Shape.extend({

    type: 'Rect',

    draw: function(ctx) {
        var hasFill = this.setFill(ctx),
            hasStroke = this.setStroke(ctx);
        // 绘制矩形
        ctx.beginPath();
        ctx.rect(0, 0, this.width, this.height);
        ctx.closePath();
        hasFill && ctx.fill();
        hasStroke && ctx.stroke();
    },

    _initGraphics: function(props) {
        this.style({
            fill: props.fill,
            stroke: props.stroke,
            strokeWidth: props.strokeWidth || 1
        });
    }

});

return Rect;
});