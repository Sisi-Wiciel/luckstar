define([
    'angular',
    'app'
], function (angular, app) {
    "use strict";

    app.directive('topicPanel', function ($timeout) {

            return {
                templateUrl: 'components/topics/topic-panel.html',
                scope: {
                    'topic': '=',
                },
                link: function(scope, elem){
                },
                controller: function ($scope, $timeout, socketSrv, authSrv, messageCenter) {
                    $scope.checkedOpt = -1;
                    $scope.countdown = 15;

                    var ignoreCountDown = false;
                    var curr = authSrv.getCurrentUser();

                    var setVerdict = function (verObj) {
                        $scope.verdict = verObj;
                        $scope.$emit('topicVerdict', verObj);

                        $scope.verdictCls=""
                        if (verObj) {
                            if ($scope.verdict.user) {
                                //if ($scope.verdict.user.id === curr.id) {
                                    //active mode
                                    if ($scope.verdict.verdict) {
                                        //topic correct
                                        $scope.verdictCls = 'correct';

                                    } else {
                                        //topic incorrec
                                        $scope.verdictCls = 'incorrect';
                                    }
                                //}
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
                            $scope.checkedOpt = opt;
                            if($scope.auth){
                                socketSrv.topicCheckOpt(opt);
                            }else{
                                messageCenter.alert("没有权限回答此问题");
                            }


                        }
                    };

                    $scope.$on('checkable', function (event, auth) {
                        $scope.auth = auth;
                    });

                }
            }
        }
    )
    ;
});
