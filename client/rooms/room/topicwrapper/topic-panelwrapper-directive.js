module.exports = function() {
  return {
    template: require('./topic-panelwrapper.html'),
    transclude: true,
    controller: ['$scope', 'socketSrv', 'roomSrv', '$timeout', function($scope, socketSrv, roomSrv, $timeout) {
      var preCoordinate = [0, 0];
      $scope.pixel = [0, 0];
      $scope.userColors = roomSrv.getUserMousePointerColor();

      setInterval(function() {
        if (!_.isEqual(preCoordinate, $scope.pixel)) {
          preCoordinate = $scope.pixel;
          socketSrv.sendMouseTrack($scope.pixel);
        }
      }, 33);

      socketSrv.register('updateMouseTrack', function(data) {
        if (data.id !== $scope.curr.id) {
          $scope.mounseTracker(data.id, data.pixel);
        }
      });
      socketSrv.register('StartCompeteCountDown', function(countdown) {
        // for animated;
        $scope.countdown = null;
        $timeout(function() {
          $scope.countdown = countdown;
        });
      });
    }],
    link: function(scope, elem) {
      var $el = $(elem);
      var trackers = {};

      scope.mounseTracker = function(id, pixel) {
        if (!trackers.hasOwnProperty(id)) {
          var roomUsersIndex = _.findIndex(scope.room.users, {id: id});
          trackers[id] = $($el.find('.pointer')[roomUsersIndex]);
        }
        trackers[id].css({top: pixel[0], left: pixel[1]});
      };

      $el.mousemove(function(event) {
        var offset = $el.offset();
        scope.pixel = [event.pageY - offset.top, event.pageX - offset.left - 5];
      });
    }
  };
};
