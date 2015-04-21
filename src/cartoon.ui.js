
define(function (require) {
    'use strict';

var cartoon = require('cartoon');

cartoon.extend({
    Viewer: require('ui/Viewer'),
    Button: require('ui/Button'),
    TextField: require('ui/TextField')
});

return cartoon;
});