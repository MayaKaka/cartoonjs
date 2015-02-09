var express = require('express');
var jade = require('jade');
var router = express.Router();

router.get('/', function(req, res) {
    res.send(jade.renderTpl('cartoonjs', { pageview: 'cartoonjs' }));
});

module.exports = router;
