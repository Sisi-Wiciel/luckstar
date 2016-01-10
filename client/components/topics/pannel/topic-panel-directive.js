define([
    'angular',
    'app',
    'settings',
], function (angular, app, settings) {
    "use strict";

    app.directive('topicPanel', function ($timeout) {

            return {
                templateUrl: '/components/topics/pannel/topic-panel.html',
                scope: {
                    'topic': '=',
                },
                link: function (scope, elem) {

                },
                controller: function ($scope, $rootScope, $timeout, socketSrv, authSrv, messageCenter) {
                    $scope.imageEnabled = false;
                    $scope.checkedOpt = [];
                    $scope.countdown = 15;
                    $scope.uploadPath = settings.upload.path;
                    var curr = authSrv.getCurrentUser();

                    var setVerdict = function (verObj) {
                        $scope.verdict = verObj;
                        $scope.$emit('topicVerdict', verObj);

                        $scope.verdictCls = ""
                        if (verObj) {
                            if ($scope.verdict.user) {
                                //active mode
                                if ($scope.verdict.verdict) {
                                    //topic correct
                                    $scope.verdictCls = 'correct';

                                } else {
                                    //topic incorrec
                                    $scope.verdictCls = 'incorrect';
                                }
                            } else {
                                //topic timeout
                                $scope.verdictCls = 'timeout';
                            }

                        }
                    }

                    socketSrv.register('topicVerdict', function (obj) {
                        setVerdict(obj);
                        $scope.$apply();
                    });

                    socketSrv.register('updateTopicCountdown', function (number) {
                            $scope.countdown = number;
                            $scope.$apply();

                    });

                    $scope.$watch('topic', function (newValue, oldValue) {
                        if (newValue && newValue._id) {
                            setVerdict(null);
                            $scope.checkedOpt = [];
                        }
                    });

                    $scope.check = function (opt) {
                        if (!$scope.verdict) {

                            if($scope.auth){
                                if ($scope.checkedOpt.indexOf(opt) > -1) {
                                    $scope.checkedOpt = _.without($scope.checkedOpt, opt);
                                }else{
                                    $scope.checkedOpt.push(parseInt(opt));
                                }

                                if($scope.topic.answercount == $scope.checkedOpt.length){
                                    socketSrv.topicCheckOpt($scope.checkedOpt.join(""));
                                }

                            }else{
                                messageCenter.alert("没有权限回答此问题");
                            }
                        }
                    };

                    $scope.showTip = function () {
                        var _topic = $scope.topic;
                        return !_topic.hasOwnProperty('corrector') && !_.isEmpty($scope.checkedOpt) &&
                            _topic.answercount && _topic.answercount - $scope.checkedOpt.length > 0;
                    }

                    $scope.$on('checkable', function (event, auth) {
                        $scope.auth = auth;
                    });

                }
            }
        }
    )
    ;
});
