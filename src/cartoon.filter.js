
define(function (require) {
    'use strict';

var cartoon = require('cartoon');

cartoon.extend({
    Filter: require('display/Filter')
});

return cartoon;
});