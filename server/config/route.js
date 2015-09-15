var errorHandler = require('express-error-handler');
var log = require('../log');
module.exports = function (app) {

    app.use('/api/topic', require('./../api/topic/'));
    app.use('/api/user', require('./../api/user/'));
    app.use('/api/auth', require('./../api/auth/'));
    app.use('/api/match', require('./../api/match/'));

    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(function (req, res) {
            log.error('url %s cannot found, redirect to index.html', req.url);
            //errorHandler(err);
        });

    // All other routes should redirect to the index.html
    app.route('/*')
        .get(function (req, res) {
            res.sendfile('client/index.html');
        });

    app.use(function (err, req, res, next) {
        if (err) {
            res.status(err.status || 500);
            errorHandler(err);
            return res.status(err.status).json({
                'message': err.message
            });
        }

    });

};


