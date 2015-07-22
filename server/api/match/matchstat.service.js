var Stat = require('./stat.model');
var compose = require('composable-middleware');

function fetchStat() {
  return compose()
    .use(function(req, res, next) {

      Stat.findById(req.session.stat, function (err, stat) {
        if (err) return next(err);

        if (!stat) return res.sendStatus(500);

        req.stat = stat;
        next();
      });
    });
}

exports.fetch= fetchStat;