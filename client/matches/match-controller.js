define([
  'angular',
  './match'
], function (angular, module) {
  "use strict";

  module.controller("matchCtrl", function ($scope, $q, $window, matchSrv, matchStat, Topic, authSrv) {

    $scope.topicNumOpt = [
      {number: 6,reward: 3},
      {number: 10,reward: 5},
      {number: 20,reward: 10},
      {number: 30,reward: 15},
    ];

    //$scope.number = $scope.topicNumOpt[0];

    Topic.getTotalSize().then(function(result){
      $scope.totalSize = result.total;
    });

    $scope.start = function (number) {
        if(!number){
          alert("请选择答题数量");
          return;
        }
        matchSrv.start(number).then(function () {
          $scope.next();
        });
    };

    $scope.cancel = function () {
      if($window.confirm('放弃答题将不会得到积分, 是否取消?')){
        $scope.topic = null;
        matchSrv.end();
      }
    };

    $scope.next = function () {
      $scope.topic = matchSrv.next();
      if(!$scope.topic){
        matchSrv.end().then(function(){
          $scope.stat = matchStat.get();
          authSrv.reloadUser();
        });
        return;
      }
      $scope.topicIndex = matchSrv.currIndex;
      matchStat.setCurrNum($scope.topicIndex);
      $scope.$broadcast('topicNext');
    };

    $scope.$on('topicDone', function (event) {
      matchStat.set($scope.topic.stats);
      $scope.stat = $scope.topic.stats;
    });

    $scope.init = function(){
      matchSrv.init();
      $scope.stat = null;
      $scope.topicIndex = 0;
    }

    $scope.init();
  });

});
