
define( function ( require, exports, module ) {
	"use strict";
	  
var TagCollection = function() {};

TagCollection._index = 0;
TagCollection._collection = {};

TagCollection.get = function(target, tag) {
	var index = target._tagIndex;
	if (!index) {
		index = target._tagIndex = ++this._index;
	}
	return this._collection['@' + index + ':' + tag];
}

TagCollection.set = function(target, tag, obj) {
	var index = target._tagIndex;
	if (!index) {
		index = target._tagIndex = ++this._index;
	}
	this._collection['@' + index + ':' + tag] = obj;
}

return TagCollection;
});