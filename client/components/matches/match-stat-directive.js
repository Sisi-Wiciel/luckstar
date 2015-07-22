define([
  'angular',
  'app',
], function(angular, app){
  "use strict";

  app.directive('matchStat', function(){
    return {
      templateUrl: 'components/matches/match-stat.html',
      scope: {},
      controller: function($scope, $timeout, matchStat){
        $scope.pointplus = false;
        $scope.pointsub = false;

        matchStat.query().then(function(result){
          $scope.stats = result;
        });

        $scope.$watch('stats.point', function (newValue, oldValue) {
            if(oldValue > newValue){
              //incorrect
              $scope.pointsub = true;
            }
            if(oldValue < newValue) {
              $scope.pointplus = true;
            }

        });

        $scope.$on('topicNext', function (event, topic) {
          $scope.pointplus = false;
          $scope.pointsub = false;
        });
      },
      link: function(){

      }
    }
  });
})

