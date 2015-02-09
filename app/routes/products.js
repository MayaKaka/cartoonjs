var jade = require('jade');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.send(jade.renderTpl('products', { pageview: 'products' }));
});

module.exports = router;