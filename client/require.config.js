require.config({
  paths: {
    'settings': 'settings',
    'angular': '../bower_components/angular/angular.min',
    'text': 'libs/text.min',
    'socketio': 'libs/socket.io.min',
    'bootstrap': '../bower_components/bootstrap/dist/js/bootstrap.min',
    'jquery': '../bower_components/jquery/dist/jquery.min',
    'angular-ui-route': '../bower_components/angular-ui-router/release/angular-ui-router.min',
    'lodash': '../bower_components/lodash/lodash.min',
    'moment': '../bower_components/moment/min/moment.min',
    'moment-zh': '../bower_components/moment/locale/zh-cn',
    'angular-animate': '../bower_components/angular-animate/angular-animate.min',
    'angular-cookie': '../bower_components/angular-cookies/angular-cookies.min',
    'angular-sanitize': '../bower_components/angular-sanitize/angular-sanitize.min',
    'angular-strap': '../bower_components/angular-strap/dist/angular-strap.min',
    'angular-strap-tpl': '../bower_components/angular-strap/dist/angular-strap.tpl.min',
    'app': 'app'
  },
  shim: {
    'angular': {
      deps: ['jquery'],
      exports: 'angular'
    },
    'bootstrap': {
      deps: ['jquery']
    },
    'lodash': {
      exports: 'lodash'
    },
    'socketio': {
      exports: 'socketio'
    },

    'angular-ui-route': ['angular'],

    'angular-cookie': ['angular'],

    'angular-animate': ['angular'],

    'angular-strap': ['angular'],

    'angular-strap-tpl': ['angular', 'angular-strap'],

    'angular-sanitize': ['angular']
  }
});

require(['app'], function(app) {
  app.boot();
});
