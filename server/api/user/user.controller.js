var User = require("./user.model");
var _ = require('lodash');
var redis = require('../redis/redis.service');

function save (req, res) {
  User.create(req.body, function (err, user) {
    if (err) {
      return handleError(res, err)
    }

    redis.addUser(user);
    return res.status(200).json({});
  })
};

function get (req, res) {
  var userJson = req.user.toJSON();
  userJson.point = req.user.point;
  return res.status(200).json(userJson);
};

exports.get = get;
exports.save = save;