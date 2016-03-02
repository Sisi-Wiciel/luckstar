var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

require.config({
  baseUrl: '/base/client',
  paths: {
    angular: 'bower_components/angular/angular',
    jquery: 'bower_components/jquery/dist/jquery',
    lodash: 'bower_components/lodash/lodash',
    bootstrap: 'bower_components/bootstrap/dist/js/bootstrap',
    'angular-route': 'bower_components/angular-route/angular-route',
    'angular-cookie': 'bower_components/angular-cookies/angular-cookies',
    'angular-animate': 'bower_components/angular-animate/angular-animate',
    'angular-resource': 'bower_components/angular-resource/angular-resource',
    'angular-sanitize': 'bower_components/angular-sanitize/angular-sanitize',
    angularMocks: 'bower_components/angular-mocks/angular-mocks',
    app: 'app'
  },
  shim: {
    angular: {exports: 'angular'},
    app: {exports: 'app'},
    bootstrap: {
      deps: ['jquery']
    },
    angularMocks: {deps: ['angular']},
    lodash: {exports: 'lodash'},
    'angular-route': {exports: 'angular-route'},
    'angular-cookie': {exports: 'angular-cookie'},
    'angular-bootstrap': {exports: 'angular-bootstrap'},
    'angular-animate': {exports: 'angular-animate'},
    'angular-resource': {exports: 'angular-resource'},
    'angular-sanitize': {exports: 'angular-sanitize'}
  },

  //dynamically load all test files
  deps: tests,

  // we have to kickoff jasmine, as it is asynchronous
  callback: function(params) {
    require('app', 'text!/client/components/topics/topic-commit.html').boot(function() {
      window.__karma__.start(params)
    });
  }
});
