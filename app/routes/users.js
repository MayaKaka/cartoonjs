var express = require('express');
var jade = require('jade');

var router = module.exports = express.Router();

router.get('/', function(req, res) {
    res.render('user', { title: 'User' });
});

router.get('/list', function(req, res) {
    res.send(jade.renderTpl('userlist', { pageview: 'userlist' }));
});

router.get('/login', function(req, res) {
    res.send('login success!');
});

router.get('/info', function(req, res) {
    res.send({
        name: 'admin',
        age: 22,
        job: 'web developer'
    });
});
