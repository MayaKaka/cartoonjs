var express = require('express');
var jade = require('jade');
var router = express.Router();

var fn = jade.compileFile('app/views/home_doc.jade', {});

/* GET home page. */
router.get('/', function(req, res) {
    if (req.query.debug) {
        res.render('home_doc', { pageurl: 'doc' });
    } else {
        res.send(fn({  pageurl: 'doc' }));
    }
});

module.exports = router;