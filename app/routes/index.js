var express = require('express');
var jade = require('jade');

var router = module.exports = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.send(jade.renderTpl('index', { pageview: 'index' }));
});
