'use strict';

var express = require('express');
var controller = require('./topic.controller');
var auth = require('../auth/auth.service');
//var stat = require('../match/matchstat.service');

var router = express.Router();

module.exports = router;

//router.post('/:id/checkup', auth.isAuth(), stat.fetch(), controller.checkTopic);
router.post('/', controller.addTopic);
//router.get('/', auth.isAuth(), stat.fetch(), controller.queryTopics);
router.get('/totalsize', controller.getTotalSize);
