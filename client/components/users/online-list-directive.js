define([
  'angular',
  'app'
], function(angular, app){
  "use strict";

  app.directive('onlineList', function(){

    return {
      templateUrl: 'components/users/online-list.html',
      scope: {
      },
      controller: function($scope, $timeout, socketSrv, authSrv){
        $scope.userlist = [];
        var curr = authSrv.getCurrentUser();
        socketSrv.register('users', $scope.userlist, function(){
          $scope.$apply();
        });

        $scope.$watch('userlist', function (newValue, oldValue) {
          console.info(newValue)
        });
        socketSrv.online(curr._id);
      }
    }
  });
});
