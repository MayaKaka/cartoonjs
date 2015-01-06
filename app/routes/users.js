var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.render('user', { title: 'User' });
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

module.exports = router;
