var User = require("./user.model");
var _ = require('lodash');
var userService = require('./user.service');

function save (req, res) {
    User.create(req.body, function (err, user) {
        if (err) {
            return handleError(res, err)
        }

        userService.add(user).then(function(){
            return res.status(200).json({});
        })

    })
};

function get (req, res) {
    User.findById(req.user._id, '-salt -hashedPassword').populate('stats').exec(function (err, user) {
        var userJson = req.user.toJSON();
        userJson.point = req.user.point;
        return res.status(200).json(userJson);
    });
};

exports.get = get;
exports.save = save;