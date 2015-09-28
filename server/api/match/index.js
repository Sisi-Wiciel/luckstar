'use strict';

var express = require('express');
var matchCtl = require('./match.controller');
var auth = require('../auth/auth.service');
var stat = require('../match/matchstat.service');

var router = express.Router();

module.exports = router;

router.get('/statistics', auth.isAuth(), stat.fetch(), matchCtl.statistics);

router.post('/end', auth.isAuth(), stat.fetch(), matchCtl.end);

router.post('/startup/:number', auth.isAuth(), matchCtl.startup);
