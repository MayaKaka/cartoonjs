var express = require('express');
var jade = require('jade');

var router = module.exports = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    var name = req.query.name;
    res.send(jade.renderTpl('demo', { pageview: 'demo' }));
});
