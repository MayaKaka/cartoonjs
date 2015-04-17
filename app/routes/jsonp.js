var express = require('express');
var router = module.exports = express.Router();


router.get('/', function(req, res) {
    var cb = req.query.callback;

    console.log(req.query);

    if (req.query.type == 1) {
        res.send(cb + '(' + '{"errno":0,"data":{"left_num":199978}}' + ')');
    } else if (req.query.type == 2) {
        res.send(cb + '(' + '{"errno":0,"data":{"token":"7e11f4f90d32635d1b333fcb21c66304"}}' + ')');
    }  else if (req.query.type == 3) {
        res.send(cb + '(' + '{"errno":1,"data":[]}' + ')');
    } else {
        res.send('none');
    }

});