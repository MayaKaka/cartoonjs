var express = require('express');
var jade = require('jade');
var router = express.Router();

var fn = jade.compileFile('app/views/home_demo.jade', {});

/* GET demo page. */
router.get('/', function(req, res) {
    res.send(
        fn({
            pageurl: 'demo'
        })
    );
});

module.exports = router;
