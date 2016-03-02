define([
  'angular',
  'lodash',
  'app',
  'moment'
], function(angular, _, app, moment) {
  'use strict';
  app.directive('fromNow', function($compile, $interval) {
    return {
      restrict: 'A',
      link: function(scope, ele, attr) {
        ele.html(moment(attr.fromNow).fromNow());

        $interval(function() {
          ele.html(moment(attr.fromNow).fromNow());
        }, 5000);
      }
    };
  });
});
