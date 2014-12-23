
define( function ( require, exports, module ) {
	"use strict";

var Filter = function() {};

Filter.get = function(image, type, value) {
	var filter = Filter.filters[type];
	// 获取滤镜处理后的图像
	if (filter) {
		return filter(image, value);
	}
};

Filter.filters = {};

return Filter;
});