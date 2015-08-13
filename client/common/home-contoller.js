define([
  'angular',
], function(angular){
  "use strict";

  angular.module('luckStar').controller('homeCtrl', function($scope, socketSrv, $window){
    $scope.chatting = false;
    $scope.messages = [];
    $scope.showChatPanel = function(to){
      $scope.toUser = to;
      $scope.chatting = true;
    };

    $scope.hideChatPanel = function(){
      $scope.chatting = false;
    }

    $scope.addMessage = function(item){
      if(!$scope.messages[item.from.id]){
        $scope.messages[item.from.id] = [];
      }

      item.time = new Date();
      $scope.messages[item.from.id].push(item);
    };

    socketSrv.register('receive messages', function(item){

      $scope.addMessage(item)

      if($scope.chatting && item.from.id == $scope.toUser.id){
          $scope.showChatPanel(item.from);
      }else{
        if($window.confirm(item.from.username + ":"+item.content)){
          $scope.showChatPanel(item.from);
        }
      }

      $scope.$apply();
    });

  });

})
