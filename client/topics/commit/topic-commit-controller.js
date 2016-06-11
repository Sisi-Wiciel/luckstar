'use strict';

require('./topic-commit.css');

module.exports = ['$scope', '$timeout', 'socketSrv', 'messageCenter', 'authSrv', 'fileSrv', '$mdDialog', function($scope, $timeout,
                                                                                                     socketSrv,
                                                                                                     messageCenter,
                                                                                                     authSrv, fileSrv, $mdDialog) {
  var curr = authSrv.getCurrentUser();

  $scope.points = [
    {value: '2', label: '2分'},
    {value: '5', label: '5分'},
    {value: '10', label: '10分'}
  ];

  $scope.removeOpt = function(opt) {
    if ($scope.topic.options.length <= 2) {
      messageCenter.error('至少要有2个选项');
      return;
    }

    _.remove($scope.topic.options, opt);

    _.each($scope.topic.options, function(opt, index) {
      opt.title = String.fromCharCode(index + 65);
    });

    $scope.topic.corrector = [];
  };
  $scope.addOpt = function() {
    if ($scope.topic.options.length >= 5) {
      messageCenter.error('最多要有5个选项');
      return;
    }
    var _opt = {
      title: '',
      value: ''
    };

    var lastTitle = _.last($scope.topic.options).title;

    var code = lastTitle.charCodeAt(0);
    _opt.title = String.fromCharCode(++code);
    $scope.topic.options.push(_opt);
  };

  $scope.initForm = function() {

      //Fix F5 issue
      if (_.isEmpty(curr)) {
        $timeout($scope.initForm, 100);
        return;
      }

      $scope.imageEnabled = false;
      fileSrv.setFile(null);

      $scope.topic = {
        options: [
          {title: 'A', value: ''},
          {title: 'B', value: ''}
        ],
        creator: curr.id,
        creatorUsername: curr.username,
        corrector: [0],
        answercount: 1,
        point: $scope.points[0].value
      };


  };

  $scope.submit = function(event) {
    var topic = $scope.topic;

    if (!topic.title) {
      messageCenter.error('请填写题目');
      return;
    }
    if (topic.title.length > 80) {
      messageCenter.error('题目字数不要超过80个字符');
      return;
    }

    topic.options = _.map(topic.options, function(opt) {
      return opt.value;
    });

    if (_.compact(topic.options).length < 2) {
      messageCenter.error('请填写至少2个选项');
      return;
    }

    if (_.isEmpty(topic.corrector)) {
      messageCenter.error('请选择题目的正确答案');
      return;
    }

    if ($scope.imageEnabled && !fileSrv.getFile()) {
      messageCenter.error('请在预览中加入图片');
      return;
    }

    $timeout(function() {
      var dialogScope = $scope.$new();
      dialogScope.topic = topic;
      $mdDialog.show({
        controller: 'topicCommitStatusCtrl',
        template: require('./preview/topic-commit-status.html'),
        scope: dialogScope,
        parent: angular.element(document.body),
        targetEvent: event,
        clickOutsideToClose:true,
        fullscreen: !$scope.bigScreen
      }).finally($scope.initForm);
    }, 1000);
  };


  $scope.addImage = function() {
    $scope.topic.image = !!!$scope.topic.image;
    if (!$scope.topic.image) {
      fileSrv.setFile(null);
    }
  };

  $scope.$watch('topic.corrector', function(newValue) {
    if (newValue && !_.isEmpty(newValue)) {
      $scope.topic.answercount = $scope.topic.corrector.length;
    }
  });
  socketSrv.changeUserStatus('IN_TOPIC');
  $scope.initForm();
}];
