'use strict';

var Leap = require('leapjs');
var Controller = new Leap.Controller();

module.exports = function (app) {
    app.get('/leap', function (req, res) {
        res.render('index');
    });
};
