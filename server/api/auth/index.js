var express = require("express"),
  router = express.Router(),
  controller = require('./auth.controller');

router.post('/', controller.login);
router.post('/name', controller.uniqueName);

module.exports = router;