var express = require('express');
var jade = require('jade');

var router = module.exports = express.Router();

router.get('/', function(req, res) {
    res.send(jade.renderTpl('tools', { pageview: 'tools' }));
});
