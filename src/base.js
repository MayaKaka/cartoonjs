
define(function (require) {
    'use strict';

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (target) {
        for (var i=0, l=this.length; i<l; i++) {
            if (this[i] === target) {
                return i;
            }
        }
        return -1;
    }
    Array.prototype.forEach = function (func) {
        for (var i=0, l=this.length; i<l; i++) {
            func(this[i], i);
        }
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
        var body = document.body,
            docu = document.documentElement;
        return {
            width: Math.min(body.clientWidth, docu.clientWidth),
            height: Math.min(body.clientHeight, docu.clientHeight)
        }
    }
}

var setRenderMode = function(mode) {
    if (mode === 'canvas' || mode === 1) {
        this._renderMode = 1;
    } else {
        this._renderMode = 0;
    }
}

return {
    _renderMode: 0,
    
    extend: extend, 
    random: random,
    getWinSize: getWinSize,
    setRenderMode: setRenderMode

};

});