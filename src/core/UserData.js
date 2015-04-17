
define(function (require) {
    'use strict';

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

UserData.step = function(target, fx) {
    var pos = fx.pos,
        start = fx.start,
        end = fx.end,
        data = target._userData;

    for (var i in end) {
        data[i] = (end[i] - start[i]) * pos + start[i];
    }
}

return UserData;
});