
define(function (require) {
    'use strict';

var TagCollection = function() {};

TagCollection._index = 0;
TagCollection._collection = {};

TagCollection.get = function(target, tag, clear) {
    var index = target._tagIndex;
    if (!index) {
        index = target._tagIndex = ++this._index;
    }
    var key = '@' + index + ':' + tag,
        obj = this._collection[key];
    if (clear) {
        this._collection[key] = null;
    }
    return obj;
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