'use strict';

require('./home.css');

module.exports = ['$scope', 'socketSrv', 'authSrv', 'messageCenter', '$location', '$mdSidenav', '$mdMedia', 'navbarSrv', function($scope,
                                                                                                                                  socketSrv,
                                                                                                                                  authSrv,
                                                                                                                                  messageCenter,
                                                                                                                                  $location,
                                                                                                                                  $mdSidenav,
                                                                                                                                  $mdMedia,
                                                                                                                                  navbarSrv) {
  $scope.currentUser = authSrv.getCurrentUser();
  $scope.currentMenu = function() {
    return navbarSrv.getCurrentItem($location.path());
  };
  $scope.toggleSidenav = function(componentId) {
    $mdSidenav(componentId).toggle();
  };
  $scope.$watch(function() {
    return $mdMedia('gt-md');
  }, function(big) {
    $scope.bigScreen= big;
  });
  socketSrv.changeUserStatus('HOME_PAGE');

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
  //console.info($mdMedia('gt-md'));
}];
