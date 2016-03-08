define([
  'angular',
  'lodash',
  'app',
  'jquery'
],
function(angular, _, app, $) {
  'use strict';

  app.directive('competeStatistic', function($timeout) {
    return {
      scope: {
        room: '='
      },
      templateUrl: 'components/compete/statistic/statistic.html',
      controller: function($scope, roomSrv) {
        $scope.statTable = false;
        roomSrv.onEndCompetition($scope.setScorebarWidth);

        $scope.switchStatTable = function() {
          $scope.statTable = !$scope.statTable;
          $scope.statTable || $scope.setScorebarWidth();
        };

        $scope.roomstat = roomSrv.getRoomStat();

        // Fix F5 issue.
        $timeout(function() {
          $scope.setScorebarWidth();
        }, 500);
      },
      link: function(scope, elem) {
        scope.setScorebarWidth = function() {
          $timeout(function() {
            var _stat = scope.roomstat;
            if (_stat) {
              elem.find('.statistic .progress>.progress-bar').each(function(index) {
                $(this).width(_stat.users[index].point / _stat.maxNum * 10 + '%');
              });

              $timeout(function() {
                elem.find('.statistic .progress>.progress-bar').removeClass('active');
              }, 2000);
            }
          });
        };
      }
    };
  });
});
