var express = require('express');
var jade = require('jade');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.send(jade.renderTpl('index', { pageview: 'index' }));
});

module.exports = router;
