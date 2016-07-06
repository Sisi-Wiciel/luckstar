var _ = require('lodash');

var logger = require('../../log');
var User = require("./user.model");
var userService = require('./user.service');

module.exports = {
  save: saveUser,
  get: getUser
}

function saveUser(req, res) {
  userService.isUniqueName(req.body.username).then(function(result) {
    if (result) {
      User.create(req.body, function(err, user) {
        if (err) {
          return handleError(res, err)
        }
        userService.add(user).then(function() {
          res.status(200).json({});
        });
      });
    } else {
      logger.warn('Could not save user, due to username ' + user.username + ' was existed');
      res.status(401).json({message: '用户已经存在'});
    }
  });
}

function getUser(req, res) {
  userService.list(req.user._id.toString()).then(function(user) {
    res.status(200).json(user);
  });
}

