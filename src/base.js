
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

var extend = function (origin, props) {
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

var getWinSize = function() {
	if (window.innerWidth !== undefined) {
		return {
			width: window.innerWidth,
			height: window.innerHeight
		}
	} else {
		return {
			width: document.body.clientWidth,
			height: document.body.clientHeight
		}
	}
}

return { 
	version: '0.0.0', 
	DEG_TO_RAD: Math.PI/180,
	extend: extend, 
	random: random,
	getWinSize: getWinSize 
};

});