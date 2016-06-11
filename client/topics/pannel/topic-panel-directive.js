/* eslint consistent-return: 0 */
'use strict';

require('./topic-panel.css');

module.exports = ['$timeout', function($timeout) {
  return {
    template: require('./topic-panel.html'),
    scope: {
      topic: '='
    },
    link: function(scope, elem) {
      scope.countdownPause = function() {
        $timeout(function() {
          $(elem).find('.progress-bar').addClass('paused');
        });
      };
    },
    controller: ['$scope', 'socketSrv', 'authSrv', 'roomSrv', function($scope, socketSrv, authSrv, roomSrv) {
      var settings = require('../../settings');

      $scope.imageEnabled = false;
      $scope.checkedOpt = [];
      $scope.uploadPath = settings.upload.path;

      $scope.setOptBgColorByUser = function(optIndex) {
        var verdict_ = $scope.verdict;
        if (!verdict_ || !verdict_.user) {
          return;
        }

        var curr = authSrv.getCurrentUser();
        if (verdict_.opt.indexOf(optIndex) > -1 && verdict_.user.id !== curr.id) {
          return ('#' + roomSrv.getUserMousePointerColor($scope.verdict.user.id)) || '';
        }
        return '';
      };

      var setVerdict = function(verObj) {
        $scope.verdict = verObj;
        $scope.$emit('topicVerdict', verObj);

        $scope.verdictCls = null;

        if (verObj) {
          $scope.countdownPause();
          if ($scope.verdict.user) {
            if ($scope.verdict.verdict) {
              $scope.verdictCls = 'correct';
            } else {
              $scope.verdictCls = 'incorrect';
            }
          } else {
            $scope.verdictCls = 'timeout';
          }
        }
      };

      socketSrv.register('topicVerdict', function(obj) {
        setVerdict(obj);
        $scope.$apply();
      });

      $scope.$watch('topic', function(newValue) {
        if (newValue && newValue._id) {
          setVerdict(null);
          $scope.checkedOpt = [];
        }
      });

      $scope.check = function(opt) {
        if (!$scope.verdict) {
          if ($scope.checkedOpt.indexOf(opt) > -1) {
            $scope.checkedOpt = _.without($scope.checkedOpt, opt);
          } else {
            $scope.checkedOpt.push(parseInt(opt, 10));
          }

          if ($scope.topic.answercount === $scope.checkedOpt.length) {
            $scope.countdownPause();
            socketSrv.topicCheckOpt($scope.checkedOpt.join(''));
          }
        }
      };

      $scope.showTip = function() {
        var _topic = $scope.topic;
        return !_topic.hasOwnProperty('corrector') && !_.isEmpty($scope.checkedOpt) &&
        _topic.answercount && _topic.answercount - $scope.checkedOpt.length > 0;
      };
      
    }]
  };
}];
