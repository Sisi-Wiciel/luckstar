var compose = require('composable-middleware');
var User = require('../user/user.model');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var SECRET = "LuCk_StAr_SeCrEt";

function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
      expressJwt({ secret: SECRET })(req, res, next);
    })
    // Attach user to request
    .use(function(req, res, next) {

      User.findById(req.user._id, '-salt -hashedPassword').populate('stats').exec(function (err, user) {
        if (err) return next(err);
        if (!user) return res.send(401);

        req.user = user;
        next();
      });
    });
}

function genToken(user){
  return jwt.sign({_id: user._id }, SECRET, { expiresInMinutes: 60 * 5 });
}
exports.isAuth = isAuthenticated;
exports.genToken= genToken;