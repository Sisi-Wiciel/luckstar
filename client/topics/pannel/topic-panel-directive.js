/* eslint consistent-return: 0 */
'use strict';

require('./topic-panel.less');

module.exports = function() {
  return {
    template: require('./topic-panel.html'),
    scope: {
      topic: '=',
      typeable: '@',
      checkable: '@',
      themeable: '@'
    },
    link: function(scope) {
      scope.typeable = 'true';
      scope.checkable = 'true';
      scope.themeable = 'true';
    },
    controller: ['$scope', 'socketSrv', 'authSrv', 'roomSrv', '$interval', function($scope, socketSrv, authSrv, roomSrv,
                                                                                    $interval) {
      var settings = require('../../settings');
      var topicCountdownInterval;

      $scope.imageEnabled = false;
      $scope.checkedOpt = [];
      $scope.uploadPath = settings.upload.path;

      function stopCountdown() {
        $interval.cancel(topicCountdownInterval);
        topicCountdownInterval = null;
      }

      $scope.setOptBgColorByUser = function(optIndex) {
        var verdict_ = $scope.verdict;
        if (!verdict_ || !verdict_.user) {
          return;
        }

        var curr = authSrv.getCurrentUser();
        if (verdict_.opt.indexOf(optIndex) > -1 && verdict_.user.id !== curr.id) {
          return ('#' + roomSrv.getUserColor($scope.verdict.user.id)) || '';
        }
        return '';
      };

      socketSrv.register('topicCountDownUpdate', function(countdownObj) {
        var factor = 100 / countdownObj.max;

        if (countdownObj.max === countdownObj.value) {
          $scope.countdown = 100;
        } else {
          $scope.countdown = factor * countdownObj.value;
        }
        if (!topicCountdownInterval) {
          topicCountdownInterval = $interval(function() {
            if ($scope.countdown > 0) {
              $scope.countdown -= factor / 10;
            } else {
              stopCountdown();
            }
          }, 100);
        }
        $scope.$apply();
      });

      socketSrv.register('topicVerdict', function(verdict) {
        $scope.verdict = verdict;
        var topicIndexText = '';
        if ($scope.topic && $scope.topic.hasOwnProperty('index')) {
          topicIndexText = '第' + ($scope.topic.index + 1) + '题, ';
        }
        if (verdict.verdict === -1) {
          roomSrv.addMessage(topicIndexText + '答题超时');
        }
        if (verdict.verdict === 0) {
          roomSrv.addMessage(topicIndexText + '用户' + verdict.user.username + '答题错误');
        }
        if (verdict.verdict === 1) {
          roomSrv.addMessage(topicIndexText + '用户' + verdict.user.username + '答题正确');
        }
        $scope.$apply();
      });

      $scope.$watch('topic', function(newValue) {
        if (newValue && newValue.id) {
          $scope.verdict = null;
          $scope.checkedOpt = [];
        }
      });

      $scope.check = function(opt) {
        if (!$scope.checkable) {
          return false;
        }
        if (!$scope.verdict) {
          if ($scope.checkedOpt.indexOf(opt) > -1) {
            $scope.checkedOpt = _.without($scope.checkedOpt, opt);
          } else {
            $scope.checkedOpt.push(parseInt(opt, 10));
          }

          if ($scope.topic.answercount === $scope.checkedOpt.length) {
            socketSrv.topicCheckOpt($scope.checkedOpt.join(''));
            stopCountdown();
          }
        }
        return true;
      };

      $scope.showTip = function() {
        var _topic = $scope.topic;
        return !_topic.hasOwnProperty('corrector') && !_.isEmpty($scope.checkedOpt) &&
        _topic.answercount && _topic.answercount - $scope.checkedOpt.length > 0;
      };
    }]
  };
};
