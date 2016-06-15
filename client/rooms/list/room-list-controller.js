'use strict';

require('./room-list.css');

module.exports = ['$scope', 'socketSrv', 'roomSrv', '$mdDialog', function($scope, socketSrv, roomSrv, $mdDialog) {

  $scope.rooms = [];
  function fetchTopic(room) {
    if (!_.isEmpty(room.topicid)) {
      socketSrv.topicFetch(room.topicid).then(function(topic) {
        room.topic = topic;
      });
    }
  }

  function fixRoom(rooms) {
    _.each(rooms, function(room, index) {
      var viewRoom = $scope.rooms[index];
      if (_.isEmpty(viewRoom)) {
        viewRoom = room;
        $scope.rooms.push(room);
      } else {
        if (viewRoom.id === room.id) {
          // Room existed && update info
          _.assign(viewRoom, room);
        } else {
          // Room removed
          _.remove($scope.rooms, {'id': room.id});
          return;
        }
      }
      roomSrv.fillRoomUsers(viewRoom);
      fetchTopic(viewRoom);
    });
  }

  socketSrv.register('updateRooms', function(rooms) {
    if (rooms.length > 0) {
      rooms[0].status = 1;
      rooms[0].topicid = '55a875aaedcf234518e7b7f0';
    }

    fixRoom(rooms);
    $scope.$apply();
  });

  socketSrv.updateRooms();

  $scope.join = function(roomId) {
    $scope.goto('/home/rooms/' + roomId);
  };

  $scope.joinAsObs = function(roomId) {
    //roomSrv.joinRoomAsObs($stateParams.id);
    $scope.goto('/home/rooms/' + roomId);
  };

  $scope.createRoom = function($event) {
    var scope = $scope.$new();
    $mdDialog.show({
      template: require('../creation/room-creation.html'),
      parent: angular.element(document.body),
      targetEvent: $event,
      controller: 'roomCreationCtrl',
      scope: scope,
      openFrom: '#createRoomBtn',
      closeTo: '#createRoomBtn',
      clickOutsideToClose: true,
      fullscreen: !$scope.screen('gt-xs')
    }).then(function(answer) {
      // $scope.join();
    });
  }

  $scope.changeMode = function(mode) {
    $scope.roomListMode = mode;
  }
  $scope.changeUserStatus('HOME_PAGE');
}];
