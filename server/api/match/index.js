'use strict';

var express = require('express');
var controller = require('./match.controller');
var auth = require('../auth/auth.service');
var stat = require('../match/matchstat.service');

var router = express.Router();

module.exports = router;

router.get('/statistics', auth.isAuth(), stat.fetch(), controller.statistics);

router.post('/end', auth.isAuth(), stat.fetch(), controller.end);

router.post('/startup/:number', auth.isAuth(), controller.startup);
