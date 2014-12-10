
define(function () {
	"use strict";
	
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (target) {
		for (var i=0, l=this.length; i<l; i++) {
			if (this[i] === target) {
				return i;
			}
		}
		return -1;
	}
}

var expand = function (origin, props) {
	if (arguments.length === 1) {
		props = origin;
		origin = this;
	}
	
	for (var i in props) {
		origin[i] = props[i];
	}
}

var random = function(min, max) {
	return Math.round(Math.random() * (max - min)) + min;
}

return { version: '0.0.0', DEG_TO_RAD: Math.PI/180, expand: expand, random: random };
});