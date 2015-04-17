
define(function (require) {
    'use strict';

var Shape = require('shapes/Shape');
    
var Ploygon = Shape.extend({

    type: 'Ploygon',

    _htmlText: '<svg width="0" height="0" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>',
    _useSVG: true,
    _useElemSize: true,

    draw: function(ctx) {
        var path = this.path, 
            hasFill = this.setFill(ctx),
            hasStroke = this.setStroke(ctx),
            section;
        // 绘制多边形
        if (path.length > 2) {
            ctx.beginPath();
            for (var i=0, l=path.length; i<l; i++) {
                section = path[i];
                if (i === 0) {
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
            ctx.closePath();
            hasFill && ctx.fill();
            hasStroke && ctx.stroke();
        }
    },

    _initGraphics: function(props) {
        if (this.renderMode === 0) {
            this.svg = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.elem.appendChild(this.svg);
        }

        // 解析等多边形路径
        if (props.radius && props.sides) {
            var radius = props.radius,
                sides = props.sides,
                cohesion = props.cohesion,
                path = [],
                angle,
                x, y;

            for (var i=0; i<sides; i++) {
                angle = i/sides * Math.PI*2;
                x = (1 - Math.sin(angle)) * radius;
                y = (1 - Math.cos(angle)) * radius;
                path.push([x, y]);
                if (cohesion) {
                    angle += Math.PI/sides;
                    x = (1 - Math.sin(angle) * cohesion) * radius;
                    y = (1 - Math.cos(angle) * cohesion) * radius;
                    path.push([x, y]);
                }
            }

            props.path = path;
        }

        this.style({
            fill: props.fill,
            stroke: props.stroke,
            strokeWidth: props.strokeWidth || 1,
            path: props.path || []
        });
    }

});

return Ploygon;
});