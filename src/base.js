
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

var expand = function (props) {
	for (var i in props) {
		this[i] = props[i];
	}
}

var random = function(min, max) {
	return Math.round(Math.random() * (max - min)) + min;
}

return { version: '0.0.0', expand: expand, random: random };
});