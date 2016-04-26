'use strict';

require('./room-list.css');

module.exports = ['$scope', 'socketSrv', 'roomSrv', '$rootScope', 'authSrv', function($scope, socketSrv, roomSrv,
                                                                                     $rootScope, authSrv) {
  $scope.rooms = [];
  $scope.curr = authSrv.getCurrentUser();

  socketSrv.register('updateRooms', function(rooms) {
    _.map(rooms, roomSrv.fillRoomUsers);
    $scope.rooms = rooms;
    $scope.$apply();
  });

  socketSrv.updateRooms();

  $scope.join = function(roomId) {
    $rootScope.goto('/home/rooms/' + roomId);
  };

  // $scope.joinAsOb = function(roomId) {
  //  $rootScope.path('/home/rooms/' + roomId);
  // };

  socketSrv.changeUserStatus('HOME_PAGE');
}];
