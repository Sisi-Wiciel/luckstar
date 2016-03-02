define([
  'angular',
  'app'
], function(angular, app) {
  'use strict';
  app.directive('countTo', ['$timeout', function($timeout) {
    return {
      replace: false,
      scope: true,
      link: function(scope, element, attrs) {
        var e = element[0];
        var num;
        var refreshInterval;
        var duration;
        var steps;
        var step;
        var countTo;
        var increment;

        var calculate = function() {
          refreshInterval = 30;
          step = 0;
          scope.timoutId = null;
          countTo = parseInt(attrs.countTo, 10) || 0;
          scope.value = parseInt(attrs.value, 10) || 0;
          duration = (parseFloat(attrs.duration) * 1000) || 2000;

          steps = Math.ceil(duration / refreshInterval);
          increment = ((countTo - scope.value) / steps);
          num = scope.value;
        };

        var tick = function() {
          scope.timoutId = $timeout(function() {
            num += increment;
            step++;
            if (step >= steps) {
              $timeout.cancel(scope.timoutId);
              num = countTo;
              e.textContent = countTo;
            } else {
              e.textContent = Math.round(num);
              tick();
            }
          }, refreshInterval);
        };

        var start = function() {
          if (scope.timoutId) {
            $timeout.cancel(scope.timoutId);
          }
          calculate();
          tick();
        };

        attrs.$observe('countTo', function(val) {
          if (val) {
            start();
          }
        });

        attrs.$observe('value', function() {
          start();
        });

        return true;
      }
    };
  }]);
});
