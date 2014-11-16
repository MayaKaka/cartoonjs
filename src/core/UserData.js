
define( function ( require, exports, module ) {
	"use strict";
	  
var Class = require('core/Class');

var UserData = Class.extend({
	
	_data: null,
	
	init: function() {
		// 初始化私有数据
		this._data = {};
	},
	
	get: function(key) {
		return this._data[key];
	},
	
	set: function(key, value) {
		this._data[key] = value;
		return value;
	}
	
});

return UserData;
});