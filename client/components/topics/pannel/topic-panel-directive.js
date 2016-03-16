/* eslint consistent-return: 0 */
define([
  'angular',
  'app',
  'lodash',
  'settings',
  'jquery'
], function(angular, app, _, settings, $) {
  'use strict';

  app.directive('topicPanel', function($timeout) {
    return {
      templateUrl: '/components/topics/pannel/topic-panel.html',
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
      controller: function($scope, socketSrv, authSrv, messageCenter, roomSrv) {
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
            return '#' + roomSrv.getUserMousePointerColor($scope.verdict.user.id) || '';
          }
          return '';
        };

        var setVerdict = function(verObj) {
          $scope.verdict = verObj;
          $scope.$emit('topicVerdict', verObj);

          $scope.verdictCls = '';
          if (verObj) {
            $scope.countdownPause();
            if ($scope.verdict.user) {
              // active mode
              if ($scope.verdict.verdict) {
                // topic correct
                $scope.verdictCls = 'correct';
              } else {
                // topic incorrec
                $scope.verdictCls = 'incorrect';
              }
            } else {
              // topic timeout
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
      }
    };
  }
  )
  ;
});
