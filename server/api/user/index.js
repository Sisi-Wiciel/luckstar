'use strict';

var router = require('express').Router();
var controller = require('./user.controller');
var auth = require('../auth/auth.service');

router.post('/', controller.save);

router.get('/', auth.isAuth(), controller.get);

module.exports = router;