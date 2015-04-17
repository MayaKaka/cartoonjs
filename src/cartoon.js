
define(function (require) {
    'use strict';

var cartoon = require('base');

cartoon.extend({
    
    // 基础组件
    Class: require('core/Class'),
    Ticker: require('core/Ticker'),
    Preload: require('core/Preload'),
    
    // 渲染组件
    DisplayObject: require('display/DisplayObject'),
    Stage: require('display/Stage'),
    Canvas: require('display/Canvas'),
    Bitmap: require('display/Bitmap'),
    Text: require('display/Text'),

    Shape: require('shapes/Shape'),
    Rect: require('shapes/Rect'),
    Circle: require('shapes/Circle'),
    Line: require('shapes/Line'),
    Ploygon: require('shapes/Ploygon'),

    // 动画组件
    Tween: require('anim/Tween'),
    Movement: require('anim/Movement'),
    Sprite: require('anim/Sprite')

});

return cartoon;
});