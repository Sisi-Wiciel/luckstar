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
        $scope.statusList = [
          {display: '全部', value: -1, cls: 'fa-user'},
          {display: '离线', value: 0, cls: 'fa-circle text-muted'},
          {display: '在线', value: 1, cls: 'fa-circle text-success'},
          {display: '繁忙', value: 2, cls: 'fa-circle text-danger'},
        ];

        $scope.status = $scope.statusList[0];
        $scope.userlist = [];
        var curr = authSrv.getCurrentUser();

        socketSrv.register('users', function(users){
          if(_.isArray(users)){
            _.assign($scope.userlist, users);
          }else{
            $scope.userlist.push(users);
          }
          $scope.$apply();
        });
        console.info(curr, curr._id);
        socketSrv.userOnline(curr._id);
      }
    }
  });
});
