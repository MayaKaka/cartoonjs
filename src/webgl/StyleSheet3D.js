
define( function ( require, exports, module ) {
	"use strict";

var StyleSheet = require('display/StyleSheet');
	
var newStyle = function(prop, name) {
	return {
		get: function(key) {
			return this[prop][name];
		},
		set: function(key, value) {
			this[prop][name] = value;
		},
		step: function(key, fx) {
			var pos = fx.pos,
				start = fx.start,
				end = fx.end,
				value = (end - start) * pos + start;
			this[prop][name] = value;
		}
	}
}

StyleSheet.styles3d = {
	
	x: newStyle('position', 'x'),
	y: newStyle('position', 'y'),
	z: newStyle('position', 'z'),

	rx: newStyle('rotation', 'x'),
	rotateX: newStyle('rotation', 'x'),
	ry: newStyle('rotation', 'y'),
	rotateY: newStyle('rotation', 'y'),
	rz: newStyle('rotation', 'z'),
	rotateZ: newStyle('rotation', 'z'),

	sx: newStyle('scale', 'x'),
	scaleX: newStyle('scale', 'x'),
	sy: newStyle('scale', 'y'),
	scaleY: newStyle('scale', 'y'),
	sz: newStyle('scale', 'z'),
	scaleZ: newStyle('scale', 'z')

}

return StyleSheet;
});