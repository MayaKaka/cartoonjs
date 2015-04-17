
define(function (require) {
    'use strict';
       
var Class = require('core/Class'),
    DisplayObject = require('display/DisplayObject');

var Animation = Class.extend({
    
    type: 'Animation',
    
    _paused: true,
    
    play: function(name) {
        this._paused = false;
    },
    
    stop: function() {
        this._paused = true;
    }
    
});

Animation.AnimatedObject = DisplayObject.extend({
    
    type: 'AnimatedObject',
    
    _paused: true,
    
    play: function(name) {
        this._paused = false;
    },
    
    stop: function() {
        this._paused = true;
    }
    
});

return Animation;
});