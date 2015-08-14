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
      controller: function($scope, $timeout, socketSrv, authSrv, $window) {
        $scope.curr = authSrv.getCurrentUser();

        $scope.send = function(){
          var msg = $scope.messageInput;
          socketSrv.sendMsg($scope.curr._id, $scope.toUser.id, msg);
          if(!$scope.messages[$scope.toUser.id]){
            $scope.messages[$scope.toUser.id] = [];
          }
          $scope.messages[$scope.toUser.id].push({
            content: msg,
            time: new Date(),
            from: $scope.curr
          })
          $scope.messageInput = "";
          $scope.$apply();
        }


      },
      link: function(scope, ele){
        var $elem = $(ele);
        scope.$on('receivedMessage', function (event) {
          $elem.find('.panel-body').scrollTop(600);
        });

        $elem.find("input").on('keydown', function(event){
            if(event.keyCode == 13){
              scope.send();
              $elem.find('.panel-body').scrollTop(600);
            }
        })

      }
    }
  });
});
