'use strict';

var express = require('express');
var controller = require('./user.controller');
var auth = require('../auth/auth.service');

var router = express.Router();



router.post('/', controller.save);

router.get('/', auth.isAuth(), controller.get);

module.exports = router;