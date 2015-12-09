define([
    'angular',
    'app'
], function (angular, app) {
    "use strict";

    app.directive('topicPanel', function ($timeout) {

            return {
                templateUrl: 'components/topics/topic-panel.html',
                scope: {
                    'topic': '='
                },
                link: function(scope, elem){
                },
                controller: function ($scope, $timeout, socketSrv, authSrv, $interpolate) {
                    $scope.checkedOpt = -1;
                    $scope.countdown = 15;

                    var ignoreCountDown = false;
                    var curr = authSrv.getCurrentUser();

                    var setVerdict = function (verObj) {
                        $scope.verdict = verObj;
                        $scope.$emit('topicVerdict', verObj);
                        if (verObj) {
                            if ($scope.verdict.user) {
                                if ($scope.verdict.user.id === curr._id) {
                                    //active mode
                                    if ($scope.verdict.verdict) {
                                        //topic correct
                                        $scope.verdictCls = "correct";
                                        $scope.verdictIcon = "fa-smile-o";
                                    } else {
                                        //topic incorrect
                                        $scope.verdictCls = "incorrect";
                                        $scope.verdictIcon = "fa-frown-o";
                                    }
                                } else {
                                    //passive mode
                                    $scope.verdictCls = "passive";
                                    $scope.verdictIcon = "fa-lock";
                                    $scope.checkedOpt = verObj.opt;
                                }
                            } else {
                                //topic timeout
                                $scope.verdictCls = "timeout";
                                $scope.verdictIcon = "fa-lock";
                            }

                        } else {
                            $scope.verdictCls = "";
                            $scope.verdictIcon = "";
                        }
                    }

                    socketSrv.register('topicVerdict', function (obj) {
                        setVerdict(obj);
                        $scope.$apply();
                    });

                    socketSrv.register('updateTopicCountdown', function (number) {
                        if (!ignoreCountDown) {
                            $scope.countdown = number;
                            $scope.$apply();
                        }

                    });

                    $scope.$watch('topic', function (newValue, oldValue) {
                        if (newValue && newValue._id) {
                            setVerdict(null);
                            ignoreCountDown = false;
                            $scope.checkedOpt = -1;
                        }
                    });

                    $scope.check = function (opt) {
                        if (!$scope.verdict) {
                            ignoreCountDown = true;
                            socketSrv.topicCheckOpt(opt);
                            $scope.checkedOpt = opt;
                        }
                    };

                }
            }
        }
    )
    ;
});
