var express = require('express');
var jade = require('jade');
var router = express.Router();

var fn = jade.compileFile('app/views/home_index.jade', {});

/* GET home page. */
router.get('/', function(req, res) {
    res.send(
        fn({
            pageurl: 'index'
        })
    );
});

module.exports = router;