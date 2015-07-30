var express = require("express"),
  router = express.Router(),
  controller = require('./auth.controller');

router.post('/', controller.login);

module.exports = router;