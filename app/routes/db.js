var express = require('express');
var jade = require('jade');
var mysql = require('mysql');
var conf = require('../../conf');

var router = module.exports = express.Router();

var pool;

var connect = function(fn, callback) {
    pool = pool || mysql.createPool(conf.dbconf);
    pool.getConnection(function(err, connection) {
        if (!err) {
            fn(connection, callback);
        } else {
            error(connection, err);
        }
    });
};

var query = function(connection, callback) {
    connection.query('show tables', '', function(err, result) {
        if (!err) { 
            success(connection, callback, result);
        } else {
            error(connection, err);
        }
    });
}

var success = function(connection, callback, result) {
    callback(result);
    connection.release();
}

var error = function(connection, err) {
    console.log(err);
    connection && connection.release();
}

router.get('/', function(req, res) {
    connect(query, function(result) {
        res.send(result);
    });
});
