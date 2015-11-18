var errorHandler = require('express-error-handler');
var log = require('../log');
var path = require('path');

module.exports = function (app) {

    app.use('/api/topic', require('../api/topic/'));
    app.use('/api/user', require('../api/user/'));
    app.use('/api/auth', require('../api/auth/'));
    app.use('/api/room', require('../api/room/'));

    app.route('/:url(api|auth|components|app|bower_components|complete)/*')
        .get(function (req, res) {
            log.error('url %s cannot found, redirect to index.html', req.url);
            //errorHandler(err);
            //res.sendFile('client/index.html');
        });

    // All other routes should redirect to the index.html
    app.route('/*')
        .get(function (req, res) {
            log.warn("unexpect url ", req.url);
            res.sendFile('client/index.html', { root: path.join(__dirname, '../../') })
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


