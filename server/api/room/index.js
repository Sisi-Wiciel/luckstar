'use strict';

var express = require('express');
var router = express.Router();
var roomCtl = require('./room.controller.js');
var auth = require('../auth/auth.service');

router.post('/', auth.isAuth(), roomCtl.new);

router.get('/:id', auth.isAuth(), roomCtl.get);

module.exports = router;