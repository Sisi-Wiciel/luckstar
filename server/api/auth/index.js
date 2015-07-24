var express = require("express"),
  User = require("../user/user.model"),
  passport = require('passport'),
  auth = require('./auth.service.js'),
  router = express.Router();
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function (username, password, done) {
    User.findOne({
      username: username.toLowerCase()
    }, function (err, user) {
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


router.post('/', function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (error) return res.status(401).json({message: error});
    if (!user) return res.status(404).json({message: '出错啦,请稍后登录.'});

    res.json({token: auth.genToken(user)});
  })(req, res, next)
});


module.exports = router;