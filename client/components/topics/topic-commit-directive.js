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
                controller: function ($scope, socketSrv, messageCenter) {
                    $scope.points = [
                        {value: "5", label: "5分"},
                        {value: "10", label: "10分"},
                        {value: "15", label: "15分"},
                        {value: "20", label: "20分"},
                    ]
                    $scope.removeOpt = function (opt) {
                        _.remove($scope.topic.options, opt);

                        _.each($scope.topic.options, function (opt, index) {
                            opt.title = String.fromCharCode(index + 65);
                        })
                    };
                    $scope.addOpt = function () {
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
                            point: $scope.points[0].value,
                        };

                        $scope.topic.corrector = 0;
                    };
                    $scope.submit = function () {
                        var t = _.clone($scope.topic);

                        if (!t.title) {
                            alert("请填写题目");
                            return;
                        }

                        t.options = _.map(t.options, function (opt) {
                            return opt.value;
                        });

                        if (_.compact(t.options).length < 2) {
                            alert("请填写至少2个选项");
                            return;
                        }

                        socketSrv.saveTopic(t, function () {
                            messageCenter.system("题目[" + _.trunc(t.title, 10) + "]提交成功");
                            $scope.reset();
                            $scope.$apply();
                        });

                    };

                    $scope.reset();
                },
                link: function (scope, elem, attr) {

                }
            };
        });
    });