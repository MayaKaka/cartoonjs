
define(function (require) {
    'use strict';

var cartoon = require('cartoon');

cartoon.extend({
    ParticleSystem: require('anim/ParticleSystem')
});

return cartoon;
});