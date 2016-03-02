var router = require("express").Router(),
  User = require("../user/user.model"),
  passport = require('passport'),
  auth = require('./auth.service.js'),
  LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    User.findOne({
      username: username.toLowerCase()
    }, function(err, user) {
      if (err) return done(err);

      if (!user) {
        return done(null, false, '用户名或密码错误.');
      }
      if (!user.authenticate(password)) {
        return done(null, false, '用户名或密码错误.');
      }
      return done(null, user);
    });
  }
));

function uniqueName(req, res, next) {
  User.findOne({username: req.body.name}, function(err, user) {
    return res.status(200).json(!!user);
  });
}
function login(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    var error = err || info;
    if (error) {
      return res.status(401).json({message: error});
    }
    if (!user) {
      return res.status(401).json({message: '用户不存在'});
    }

    res.json({token: auth.genToken(user)});

  })(req, res, next)
};

exports.login = login;
exports.uniqueName = uniqueName;
