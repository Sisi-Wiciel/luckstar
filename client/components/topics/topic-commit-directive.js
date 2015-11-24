define([
        'angular',
        'lodash',
        'app'
    ],
    function (angular, _, app) {
        'use strict';

        app.directive('topicCommit', function () {

            return {
                templateUrl: " components/topics/topic-commit.html",
                controller: function ($scope, socketSrv, messageCenter, authSrv) {
                    var curr = authSrv.getCurrentUser();
                    $scope.points = [
                        {value: "5", label: "5分"},
                        {value: "10", label: "10分"},
                        {value: "15", label: "15分"},
                        {value: "20", label: "20分"},
                    ]
                    $scope.removeOpt = function (opt) {
                        if($scope.topic.options.length <= 2){
                            messageCenter.error("至少要有2个选项");
                            return;
                        }
                        _.remove($scope.topic.options, opt);

                        _.each($scope.topic.options, function (opt, index) {
                            opt.title = String.fromCharCode(index + 65);
                        })
                    };
                    $scope.addOpt = function () {
                        if($scope.topic.options.length >= 5){
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

                    $scope.reset = function () {
                        $scope.topic = {
                            options: [
                                {title: 'A', value: ''},
                                {title: 'B', value: ''}
                            ],
                            creator:{
                                username: curr.username,
                                id: curr._id,
                            },
                            point: $scope.points[0].value,
                        };

                        $scope.topic.corrector = 0;
                    };
                    $scope.submit = function () {
                        var t = _.clone($scope.topic);

                        if (!t.title) {
                            messageCenter.error("请填写题目");
                            return;
                        }

                        t.options = _.map(t.options, function (opt) {
                            return opt.value;
                        });

                        if (_.compact(t.options).length < 2) {
                            messageCenter.error("请填写至少2个选项");
                            return;
                        }
                        socketSrv.saveTopic(t, function () {
                            messageCenter.notify("题目[" + _.trunc(t.title, 10) + "]提交成功");
                            $scope.reset();
                            $scope.$apply();
                        });

                    };
                    socketSrv.changeUserStatus("IN_TOPIC");
                    $scope.reset();
                },
                link: function (scope, elem, attr) {

                }
            };
        });
    });