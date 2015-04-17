
define(function (require) {
    'use strict';

var Shape = require('shapes/Shape');
    
var Line = Shape.extend({

    type: 'Line',

    pixelHitTest: true,
    
    _htmlText: '<svg width="0" height="0" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>',
    _useSVG: true,
    _useElemSize: true,

    draw: function(ctx) {
        var path = this.path, section, 
            hasStroke = this.setStroke(ctx);
        
        // 绘制线段
        if (hasStroke && path.length > 1) {
            ctx.beginPath();
            for (var i=0, l=path.length; i<l; i++) {
                section = path[i];
                if (i === 0 || section[2] === true) {
                    ctx.moveTo(section[0], section[1]);
                } else {
                    if (section.length === 6) {
                        ctx.bezierCurveTo(section[0], section[1], section[2], section[3], section[4], section[5]);        
                    } else if (section.length === 4) {
                        ctx.quadraticCurveTo(section[0], section[1], section[2], section[3]);        
                    } else {
                        ctx.lineTo(section[0], section[1]);
                    }
                }
            }
            ctx.stroke();
        }
    },

    _initGraphics: function(props) {
        if (this.renderMode === 0) {
            this.svg = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.elem.appendChild(this.svg);
        }

        this.style({
            stroke: props.stroke,
            strokeWidth: props.strokeWidth || 1,
            path: props.path || []
        });
    }

});

return Line;
});