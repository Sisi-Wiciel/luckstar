'use strict';

require('./room-list.css');

module.exports = ['$scope', 'socketSrv', 'roomSrv', '$location', 'authSrv', function($scope, socketSrv, roomSrv,
                                                                                     $location, authSrv) {
  $scope.rooms = [];
  $scope.curr = authSrv.getCurrentUser();

  socketSrv.register('updateRooms', function(rooms) {
    _.map(rooms, roomSrv.fillRoomUsers);
    $scope.rooms = rooms;
    $scope.$apply();
  });

  socketSrv.updateRooms();

  $scope.join = function(roomId) {
    $location.path('/home/rooms/' + roomId);
  };

  // $scope.joinAsOb = function(roomId) {
  //  $location.path('/home/rooms/' + roomId);
  // };

  socketSrv.changeUserStatus('HOME_PAGE');
}];
