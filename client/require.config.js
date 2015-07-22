require.config({
  paths: {
    angular: 'bower_components/angular/angular.min',
    bootstrap: 'bower_components/bootstrap/dist/js/bootstrap.min',
    jquery: 'bower_components/jquery/dist/jquery.min',
    'angular-route': 'bower_components/angular-route/angular-route.min',
    'lodash': 'bower_components/lodash/lodash.min',
    'angular-animate': 'bower_components/angular-animate/angular-animate.min',
    'angular-sanitize': 'bower_components/angular-sanitize/angular-sanitize.min',
    'angular-cookie': 'bower_components/angular-cookies/angular-cookies.min',
    'angular-resource': 'bower_components/angular-resource/angular-resource.min',
    'angular-bootstrap': 'bower_components/angular-bootstrap/ui-bootstrap',
    'angular-bootstrap-tpls': 'bower_components/angular-bootstrap/ui-bootstrap-tpls',
    'app': 'app'
  },
  shim: {
    app: {
      exports: 'app'
    },
    angular: {
      deps: ['jquery'],
      exports: 'angular'
    },

    bootstrap: {
      deps: ['jquery']
    },
    lodash: {
      exports: 'lodash'
    },

    'angular-route': ['angular'],

    'angular-cookie':   ['angular'],

    'angular-animate':    ['angular'],

    'angular-resource':   ['angular'],

    'angular-bootstrap':   ['angular'],

    'angular-bootstrap-tpls':   ['angular', 'angular-bootstrap'],

    'angular-sanitize':   ['angular'],


  }

});


require(['app'], function (app) {
  app.boot();
});
