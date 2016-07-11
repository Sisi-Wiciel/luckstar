/* eslint no-lonely-if: 0 */
'use strict';

require('./room-list.less');
module.exports = roomListController;

/* @ngInject */
function roomListController($scope, socketSrv, roomSrv, $mdDialog) {
  $scope.rooms = [];
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
          _.remove($scope.rooms, {id: room.id});
          return;
        }
      }
      roomSrv.fillRoomUsers(viewRoom);
    });
  }

  socketSrv.register('updateRooms', function(rooms) {
    fixRoom(rooms);
    $scope.$apply();
  });

  $scope.viewTopic = function(room) {
    if (!room.topic || room.topic.id !== room.topicid) {
      socketSrv.topicFetch(room.topicid).then(function(topic) {
        room.topic = topic;
      });
    }
  };

  $scope.join = function(roomId) {
    $scope.goto('/home/rooms/' + roomId);
  };

  $scope.joinAsObs = function(roomId) {
    // roomSrv.joinRoomAsObs($stateParams.id);
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
    }).then(function() {
      $scope.join();
    });
  };

  $scope.changeMode = function(mode) {
    $scope.roomListMode = mode;
  };

  socketSrv.updateRooms();
  $scope.changeUserStatus('HOME_PAGE');
}
