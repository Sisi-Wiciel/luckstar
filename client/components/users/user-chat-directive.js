define([
  'angular',
  'app'
], function(angular, app){
  "use strict";

  app.directive('userChat', function(){

    return {
      templateUrl: 'components/users/user-chat.html',
      scope: {
        toUser: "=",
        goBack: "&",
        messages: "="
      },
      controller: function($scope, $timeout, socketSrv, authSrv) {
        var curr = authSrv.getCurrentUser();

        $scope.send = function(){

          socketSrv.sendMsg(curr._id, $scope.toUser.id, $scope.messageInput);
          if(!$scope.messages[$scope.toUser.id]){
            $scope.messages[$scope.toUser.id] = [];
          }
          $scope.messages[$scope.toUser.id].push({
            content: $scope.messageInput,
            time: new Date(),
            from: curr
          })
          $scope.messageInput = "";
          $scope.$apply();
        }

      },
      link: function(scope, ele){
        var $elem = $(ele);

        $elem.find("input").on('keydown', function(event){
          if(event.keyCode == 13){
            scope.send();
          }
        })

      }
    }
  });
});
