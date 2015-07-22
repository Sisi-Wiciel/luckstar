define([
  'angular',
  'app'
], function(angular, app){
  "use strict";

  app.directive('topicPanel', function(){
    var COUNTDOWN = 5;

    return {
      templateUrl: 'components/topics/topic-panel.html',
      scope: {
        'topic': '='
      },
      controller: function($scope, $timeout){

        $scope.countdown = COUNTDOWN;
        $scope.checkedOpt = -1;
        var checkTimeout = function(){

          $timeout(function () {
            if(_.isEmpty($scope.topic) || $scope.topic.isActived()){
              $scope.countdown = COUNTDOWN;
              return;
            }
            $scope.countdown--;

            if($scope.countdown > 0){
              checkTimeout();
            }else{
              $scope.check();
              $scope.countdown = COUNTDOWN;
            }
          }, 1000);

        };

        $scope.check = function (opt) {
          if($scope.topic.isActived()){
            return;
          }
          $scope.topic.$check({option: opt}, function(){
            $scope.$emit('topicDone', $scope.topic);
          });
          $scope.checkedOpt = opt;
        };

        $scope.$on('topicNext', function (event) {
          $scope.checkedOpt = -1;
          checkTimeout();
        });

        checkTimeout();
      }
    }
  });
});
