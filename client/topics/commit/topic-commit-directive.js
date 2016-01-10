define([
        'angular',
        'lodash',
        '../topic'
    ],
    function (angular, _, app) {
        'use strict';

        app.controller('topicCommitCtrl', function ($scope, $timeout, socketSrv, messageCenter, authSrv, fileSrv) {

            var curr = authSrv.getCurrentUser();

            $scope.showStatus;

            $scope.points = [
                {value: "2", label: "2分"},
                {value: "5", label: "5分"},
                {value: "10", label: "10分"}
            ]

            $scope.removeOpt = function (opt) {
                if ($scope.topic.options.length <= 2) {
                    messageCenter.error("至少要有2个选项");
                    return;
                }
                _.remove($scope.topic.options, opt);

                _.each($scope.topic.options, function (opt, index) {
                    opt.title = String.fromCharCode(index + 65);
                })
            };
            $scope.addOpt = function () {
                if ($scope.topic.options.length >= 5) {
                    messageCenter.error("最多要有5个选项");
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

            $scope.initForm = function () {

                $scope.showStatus = false;

                $scope.imageEnabled = false;

                fileSrv.setFile(null);

                $scope.topic = {
                    options: [
                        {title: 'A', value: ''},
                        {title: 'B', value: ''}
                    ],
                    creator: curr.id,
                    creatorUsername: curr.username,
                    corrector: "",
                    answercount: 1,
                    point: $scope.points[0].value,
                };
            };

            $scope.submit = function () {
                var t = _.clone($scope.topic);

                $scope.steps = [
                    {
                        title: '上传题目',
                        result: {
                            status: 0
                        }
                    }
                ];

                //if ($scope.imageEnabled && fileSrv.getFile()) {
                if ($scope.imageEnabled) {
                    $scope.steps.push({
                        title: '上传图片',
                    })
                }

                var setStepResult = (function (steps) {
                    var _index = 0;
                    return function (result) {
                        if (!result || steps.length == _index) {
                            return;
                        }
                        steps[_index].result = result;

                        if (!result.hasOwnProperty("index")) {
                            _index++;
                            if (steps.length > _index) {
                                steps[_index].result = {
                                    status: 0
                                }
                            }
                        }
                    }
                })($scope.steps);

                $timeout(function () {
                    setStepResult({
                        status: 1
                    });

                    (function fake (index) {
                        $timeout(function () {
                            setStepResult({
                                status: 1,
                                index: index
                            });

                            if (index < 9) {
                                fake(++index);
                            } else {
                                setStepResult({
                                    status: 1
                                });
                            }

                        }, 300);
                    })(0)

                }, 1000)

                if (!t.title) {
                    messageCenter.error("请填写题目");
                    return;
                }
                if (t.title.length > 80) {
                    messageCenter.error("题目字数不要超过80个字符");
                    return;
                }

                t.options = _.map(t.options, function (opt) {
                    return opt.value;
                });

                if (_.compact(t.options).length < 2) {
                    messageCenter.error("请填写至少2个选项");
                    return;
                }

                if (_.isEmpty(t.corrector)) {
                    messageCenter.error("请选择题目的正确答案");
                    return;
                }

                if ($scope.imageEnabled && !fileSrv.getFile()) {
                    messageCenter.error("请在预览中加入图片");
                    return;
                }

                $scope.showStatus = true;

                $timeout(function () {
                    socketSrv.saveTopic(t).then(function (result) {
                        if (result.id) {
                            setStepResult({status: 1});
                            if ($scope.imageEnabled && fileSrv.getFile()) {
                                $timeout(function () {
                                    fileSrv.upload({id: result.id}, function (result) {
                                        setStepResult(result);
                                    });
                                }, 1000);
                            }
                        } else {
                            setStepResult({status: 2});
                        }

                    });
                }, 1000);
            };

            $scope.isAllFinished = function () {

                if (_.isEmpty($scope.steps)) {
                    return false;
                }
                var finishedSteps = _.filter($scope.steps, function (step) {
                    if (step && step.result) {
                        if (step.result.hasOwnProperty('index')) {
                            return false;
                        } else {
                            return step.result.status > 0;
                        }
                    } else {
                        return false;
                    }
                });

                return finishedSteps.length === $scope.steps.length;
            };

            $scope.addImage = function () {
                if (!$scope.imageEnabled) {
                    fileSrv.setFile(null);
                }
            };

            $scope.$watch('topic.corrector', function (newValue, oldValue) {
                if (newValue && !_.isEmpty(newValue)) {
                    $scope.topic.answercount = $scope.topic.corrector.length;
                }
            });

            socketSrv.changeUserStatus("IN_TOPIC");
            $scope.initForm();

        });
    });