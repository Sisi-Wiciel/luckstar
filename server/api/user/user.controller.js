var User = require("./user.model");
var _ = require('lodash');
var userService = require('./user.service');

function save(req, res) {
  User.create(req.body, function(err, user) {
    if (err) {
      return handleError(res, err)
    }

    userService.add(user).then(function() {
      return res.status(200).json({});
    })

  })
};

function get(req, res) {
  userService.list(req.user._id.toString()).get(0).then(function(user) {
    return res.status(200).json(user);
  })

};

exports.get = get;
exports.save = save;
