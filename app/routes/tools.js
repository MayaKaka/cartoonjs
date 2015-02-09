var express = require('express');
var jade = require('jade');
var router = express.Router();

router.get('/', function(req, res) {
    res.send(jade.renderTpl('tools', { pageview: 'tools' }));
});

module.exports = router;
