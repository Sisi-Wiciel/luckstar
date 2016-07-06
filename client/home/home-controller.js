'use strict';

require('./home.css');

module.exports = ['$scope', 'socketSrv', 'authSrv', 'messageCenter', '$location','navbarSrv', function($scope,
                                                                                                                                  socketSrv,
                                                                                                                                  authSrv,
                                                                                                                                  messageCenter,
                                                                                                                                  $location,
                                                                                                                                  navbarSrv) {
  $scope.USER_LIST_MENU_NAME = 'UsersMenu';
  $scope.MAIN_NAV_MENU_NAME = 'MainNavMenu';
  $scope.currentMenu = function() {
    return navbarSrv.getCurrentItem($location.path());
  };

  $scope.changeUserStatus('HOME_PAGE');

  socketSrv.register('inviteUser', function(result) {
    messageCenter.confirm('用户' + result.user + '向你发出答题邀请.').then(function() {
      $scope.goto('/home/rooms/' + result.room);
      socketSrv.inviteUserResponse(result.userid, 1);
    }, function() {
      socketSrv.inviteUserResponse(result.userid, 0);
    });
  });

  socketSrv.register('updateUser', function(user) {
    $scope.$apply(function() {
      authSrv.updateCurrentUser(user);
    });
  });
}];
