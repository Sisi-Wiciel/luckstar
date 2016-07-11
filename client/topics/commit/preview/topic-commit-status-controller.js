'use strict';

require('./topic-commit-status.less');
module.exports = ['$scope', '$timeout', 'socketSrv', 'fileSrv', '$mdDialog', function($scope,
                                                                                      $timeout,
                                                                                      socketSrv,
                                                                                      fileSrv,
                                                                                      $mdDialog) {
  $scope.steps = [
    {
      title: '上传题目',
      result: {
        status: 0
      }
    }
  ];

  if (fileSrv.getFile()) {
    $scope.steps.push({
      title: '上传图片'
    });
  }

  var setStepResult = (function(steps) {
    var _index = 0;
    return function(result) {
      if (!result || steps.length === _index) {
        return;
      }
      steps[_index].result = result;

      if (!result.hasOwnProperty('index')) {
        _index++;
        if (steps.length > _index) {
          steps[_index].result = {
            status: 0
          };
        }
      }
    };
  })($scope.steps);
  socketSrv.saveTopic($scope.topic).then(function(result) {
    if (result.id) {
      setStepResult({status: 1});
      if ($scope.imageEnabled && fileSrv.getFile()) {
        $timeout(function() {
          fileSrv.upload({id: result.id}, function(result) {
            setStepResult(result);
          });
        }, 1000);
      }
    } else {
      setStepResult({status: 2});
    }
  });

  $scope.isAllFinished = function() {
    if (_.isEmpty($scope.steps)) {
      return false;
    }
    var finishedSteps = _.filter($scope.steps, function(step) {
      if (step && step.result) {
        if (step.result.hasOwnProperty('index')) {
          return false;
        }
        return step.result.status > 0;
      }
      return false;
    });

    return finishedSteps.length === $scope.steps.length;
  };

  $scope.close = function() {
    $mdDialog.cancel();
  };
}];
