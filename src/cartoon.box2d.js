
define(function (require) {
    'use strict';

var cartoon = require('cartoon');

cartoon.extend({
    // Box2D库文件
    PhysicsWorld: require('physics/PhysicsWorld')
});

return cartoon;
});