'use strict';

require('./room-list.css');

module.exports = ['$scope', 'socketSrv', 'roomSrv', '$mdDialog', function($scope, socketSrv, roomSrv, $mdDialog) {


  $scope.rooms = [];

  socketSrv.register('updateRooms', function(rooms) {
    _.map(rooms, roomSrv.fillRoomUsers);
    $scope.rooms = rooms;
    $scope.$apply();
  });

  socketSrv.updateRooms();

  $scope.join = function(roomId) {
    $scope.goto('/home/rooms/' + roomId);
  };

  $scope.joinAsObs = function(roomId){
    //roomSrv.joinRoomAsObs($stateParams.id);
    $scope.goto('/home/rooms/' + roomId);
  };

  $scope.createRoom = function($event){
    var scope = $scope.$new();
    console.info(scope);
    $mdDialog.show({
      template: require('../creation/room-creation.html'),
      parent: angular.element(document.body),
      targetEvent: $event,
      controller: 'roomCreationCtrl',
      scope: scope,
      openFrom: '#createRoomBtn',
      closeTo: '#createRoomBtn',
      clickOutsideToClose:true
    }).then(function(answer) {
      $scope.join();
    });
  }

  socketSrv.changeUserStatus('HOME_PAGE');
}];
