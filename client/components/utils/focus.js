define([
  'angular',
  'lodash',
  'app',
  'jquery'
], function(angular, _, app, $) {
  'use strict';
  app.directive('focusMe', function($timeout) {
    return {
      link: function(scope, element) {
        $timeout(function() {
          $(element).focus();
        });
      }
    };
  });
});
