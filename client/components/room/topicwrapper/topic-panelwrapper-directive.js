define([
  'angular',
  'app',
  'lodash',
  'settings',
  'jquery'
], function(angular, app, _, settings, $){
  'use strict';

  app.directive('roomTopicwrapper', function(){
    return {
      template  : '<div class="topic-panel-wrapper" >' +
      '<i class="fa fa-hand-o-up pointer" ng-repeat="user in room.users track by $index" ng-show="user && user.id !== curr.id" ng-style="{color: userColors[$index]}"></i>' +
      '<div ng-transclude></div>' +
      '</div>',
      transclude: true,
      controller: function($scope, socketSrv, roomSrv){
        var preCoordinate = [0, 0];
        $scope.pixel = [0, 0];
        $scope.userColors = roomSrv.getUserMousePointerColor();

        setInterval(function(){
          if (!_.isEqual(preCoordinate, $scope.pixel)) {
            preCoordinate = $scope.pixel;
            socketSrv.sendMouseTrack($scope.pixel);;
          }
        }, 33);

        socketSrv.register('updateMouseTrack', function(data){
          if(data.id !== $scope.curr.id){
            $scope.mounseTracker(data.id, data.pixel);
          }
        });
      },
      link      : function(scope, elem){
        var $el = $(elem);
        var trackers = {};

        scope.mounseTracker = function(id, pixel){
          if (!trackers.hasOwnProperty(id)) {
            var roomUsersIndex = _.findIndex(scope.room.users, 'id', id);
            trackers[id] = $($el.find('i.pointer')[roomUsersIndex]);
          }
          trackers[id].css({top: pixel[0], left: pixel[1]});
        };

        $el.mousemove(function(event){
          var offset = $el.offset();
          scope.pixel = [event.pageY - offset.top, event.pageX - offset.left - 5];
        });
      }
    };
  });
});
