'use strict';

module.exports = angular.module('luckstar.rooms', [])
.controller('roomListCtrl', require('./list/room-list-controller'))
.controller('roomCtrl', require('./room/room-controller'))
.controller('roomUsersCtrl', require('./room/users/room-users-controller'))
.controller('roomToolsCtrl', require('./room/tools/room-tools-controller'))
.controller('roomCompeteCtrl', require('./room/compete/room-compete-controller'))
.controller('roomCreationCtrl', require('./creation/room-creation-controller'))
.directive('roomStatistic', require('./room/statistic/room-statistic-directive'))
.directive('roomMessage', require('./room/message/room-message-directive'))
.directive('roomTopicwrapper', require('./room/topicwrapper/topic-panelwrapper-directive'))
.config(['$stateProvider', function($stateProvider) {
  //$stateProvider.state('home.rooms', {
  //  url: '/home/rooms',
  //  template: require('./list/room-list.html')
  //})
  $stateProvider.state('home.room', {
    url: '/home/rooms/:id',
    template: require('./room/room.html'),
    controller: 'roomCtrl'
  });
}]).name;
