var jade = require('jade');
var express = require('express');

var router = module.exports = express.Router();

router.get('/', function(req, res) {
    res.send(jade.renderTpl('product', { pageview: 'product' }));
});