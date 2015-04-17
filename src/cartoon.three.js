
define(function (require) {
    'use strict';

var cartoon = require('cartoon');

cartoon.extend({
    
    // THREE库文件
    THREE: require('webgl/THREE'),
    Object3D: require('webgl/Object3D'),
    GLCanvas: require('webgl/GLCanvas')
    
});

return cartoon;
});