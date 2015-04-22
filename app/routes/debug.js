var express = require('express');
var router = module.exports = express.Router();

router.get('/', function(req, res) {
    res.jsonp({status:1});
});

