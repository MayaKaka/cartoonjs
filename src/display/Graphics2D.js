
define( function ( require, exports, module ) {
	"use strict";
	   
var Graphics2D = function() {};

Graphics2D.get = function(type) {
	// 获取2d图形
	return Graphics2D.shapes[type];
}

Graphics2D.commonStyle = function(target, data) {
	if (data.stroke && data.lineWidth === undefined) {
		data.lineWidth = 1;
	}
	// 设置绘图样式
	target.style('fill', data.fill);
	target.style('stroke', data.stroke);
	target.style('lineWidth', data.lineWidth);
}

Graphics2D.commonDraw = function(ctx, hasFill, hasStroke) {
	// 绘制图形
	if (hasFill) ctx.fill();
	if (hasStroke) ctx.stroke();
}

Graphics2D.shapes = {
	rect: {
		type: 'rect',
		init: function(data) {
			this.style('size', data);
			// 设置通用样式
			Graphics2D.commonStyle(this, data);
		},
		draw: function(ctx) {
			// 绘制矩形
			if (this.setFill(ctx)) {
				ctx.fillRect(0, 0, this.width, this.height);
			}
			if (this.setStroke(ctx)) {
				ctx.strokeRect(0, 0, this.width, this.height);
			}
		}
	},
	
	circle: {
		type: 'circle',
		init: function(data) {
			if (data.angle === undefined) {
				data.angle = 360;
			}
			this.style('radius', data.radius);
			this.style('angle', data.angle);
			// 设置通用样式
			Graphics2D.commonStyle(this, data);
		},
		draw: function(ctx) {
			var radius = this.radius,
				hasFill = this.setFill(ctx),
				hasStroke = this.setStroke(ctx);
			// 绘制圆
			ctx.beginPath();
			ctx.arc(radius, radius, radius, 0, this.angle/360 * Math.PI*2, 0);
			if (this.angle < 360) {
				ctx.lineTo(radius, radius);
			}
			ctx.closePath();
			Graphics2D.commonDraw(ctx, hasFill, hasStroke);
		}
	},
	
	ellipse: {
		type: 'ellipse',
		init: function(data) {
			this.style('radiusXY', data);
			// 设置通用样式
			Graphics2D.commonStyle(this, data);
		},
		draw: function(ctx) {
			var k = 0.5522848,
				rx = this.radiusX,
				ry = this.radiusY,
				kx = rx * k,
				ky = ry * k,
				w = rx * 2,
				h = ry * 2,
				hasFill = this.setFill(ctx),
				hasStroke = this.setStroke(ctx);
			// 绘制椭圆
			ctx.beginPath();
			ctx.moveTo(0, ry);
			ctx.bezierCurveTo(0, ry-ky, rx-kx, 0, rx, 0);
			ctx.bezierCurveTo(rx+kx, 0, w, ry-ky, w, ry);
			ctx.bezierCurveTo(w, ry+ky, rx+kx, h, rx, h);
			ctx.bezierCurveTo(rx-kx, h, 0, ry+ky, 0, ry);
			ctx.closePath();
			Graphics2D.commonDraw(ctx, hasFill, hasStroke);
		}
	},
	
	line: {
		type: 'line',
		init: function(data) {
			if (data.lineWidth === undefined) {
				data.lineWidth = 1;
			}
			this.path = data.path;
			this.style('stroke', data.stroke);
			this.style('lineWidth', data.lineWidth);
		},
		draw: function(ctx) {
			var path = this.path, line, 
				hasStroke = this.setStroke(ctx);
			// 绘制线段
			if (hasStroke && path.length > 1) {
				ctx.beginPath();
				for (var i=0, l=path.length; i<l; i++) {
					line = path[i];
					if (i === 0) {
						ctx.moveTo(line[0], line[1]);
					} else {
						if (line.length === 2) {
							ctx.lineTo(line[0], line[1]);	
						} else if (line.length === 4) {
							ctx.quadraticCurveTo(line[0], line[1], line[2], line[3]);		
						} else if (line.length === 6) {
							ctx.bezierCurveTo(line[0], line[1], line[2], line[3], line[4], line[5]);		
						}
					}
				}
				ctx.stroke();
			}
		}
	},
	
	ploygon: {
		type: 'ploygon',
		init: function(data) {
			this.path = data.path;
			// 设置通用样式
			Graphics2D.commonStyle(this, data);
		},
		draw: function(ctx) {
			var path = this.path, line,
				hasFill = this.setFill(ctx),
				hasStroke = this.setStroke(ctx);
			// 绘制多边形
			if (path.length > 2) {
				ctx.beginPath();
				for (var i=0, l=path.length; i<l; i++) {
					line = path[i];
					if (i === 0) {
						ctx.moveTo(line[0], line[1]);
					} else {
						if (line.length === 2) {
							ctx.lineTo(line[0], line[1]);	
						} else if (line.length === 4) {
							ctx.quadraticCurveTo(line[0], line[1], line[2], line[3]);		
						} else if (line.length === 6) {
							ctx.bezierCurveTo(line[0], line[1], line[2], line[3], line[4], line[5]);		
						}
					}
				}
				ctx.closePath();
				Graphics2D.commonDraw(ctx, hasFill, hasStroke);
			}
		}
	},
	
	polyStar: {
		type: 'polyStar',
		init: function(data) {
			this.sides = data.sides;
			this.cohesion = data.cohesion;
			this.style('radius', data.radius);
			// 设置通用样式
			Graphics2D.commonStyle(this, data);
		},
		draw: function(ctx) {
			var radius = this.radius,
				sides = this.sides,
				cohesion = this.cohesion,
				angle, x, y, 
				hasFill = this.setFill(ctx),
				hasStroke = this.setStroke(ctx);
			// 绘制等多边形
			ctx.beginPath();
			for (var i=0; i<sides; i++) {
				angle = i/sides * Math.PI*2;
				x = (1 - Math.sin(angle)) * radius;
				y = (1 - Math.cos(angle)) * radius;
				if (i === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
				if (cohesion) {
					angle += Math.PI/sides;
					x = (1 - Math.sin(angle) * cohesion) * radius;
					y = (1 - Math.cos(angle) * cohesion) * radius;
					ctx.lineTo(x, y);
				}
			}
			ctx.closePath();
			Graphics2D.commonDraw(ctx, hasFill, hasStroke);
		}
	},
	
	roundRect: {
		type: 'roundRect',
		init: function() {
			
		},
		draw: function() {
			
		}
	},
	
	lines: {
		type: 'lines',
		init: function(data) {
			if (data.lineWidth === undefined) {
				data.lineWidth = 1;
			}
			this.paths = data.paths;
			this.style('stroke', data.stroke);
			this.style('lineWidth', data.lineWidth);
		},
		draw: function(ctx) {
			var paths = this.paths,
				path, line, 
				hasStroke = this.setStroke(ctx);
			// 绘制多重线段
			if (hasStroke && paths.length) {
				ctx.beginPath();
				for (var j=0, jl=paths.length; j<jl; j++) {
					path = paths[j];
					if (path.length > 1) {
						for (var i=0, l=path.length; i<l; i++) {
							line = path[i];
							if (i === 0) {
								ctx.moveTo(line[0], line[1]);
							} else {
								if (line.length === 2) {
									ctx.lineTo(line[0], line[1]);	
								} else if (line.length === 4) {
									ctx.quadraticCurveTo(line[0], line[1], line[2], line[3]);		
								} else if (line.length === 6) {
									ctx.bezierCurveTo(line[0], line[1], line[2], line[3], line[4], line[5]);		
								}
							}
						}
					}
				}
				ctx.stroke();
			}
		}
	}
}

return Graphics2D;
});