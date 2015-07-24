
module.exports = function (app) {

  app.use('/api/topic', require('./../api/topic/index'));
  app.use('/api/user', require('./../api/user/index'));
  app.use('/api/auth', require('./../api/auth/index'));
  app.use('/api/match', require('./../api/match/index'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(function(err, req, res){
      console.info("404 error")
      //var viewFilePathx`   = '404';
      //var statusCode = 404;
      //var result = {
      //  status: statusCode
      //};
      //
      //res.status(result.status);
      //res.render(viewFilePath, function (err) {
      //  if (err) { return res.json(result, result.status); }
      //
      //  res.render(viewFilePath);
      //});
    });

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile('client/index.html');
    });

  app.use(function(err, req, res, next) {
    //console.info(err);
    res.status(err.status || 500);
    console.info(err.message);
  });

};


