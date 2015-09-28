define([
    'angular',
    'app'
], function (angular, app) {
    "use strict";

    app.directive('topicPanel', function () {

        return {
            templateUrl: 'components/topics/topic-panel.html',
            scope: {
                'topic': '='
            },
            controller: function ($scope, $timeout, socketSrv) {
                $scope.checkedOpt = -1;
                socketSrv.register('topicUpdateCountdown', function(number){
                    $scope.countdown = number;
                    $scope.$apply();
                })
                //var checkTimeout = function () {
                //
                //    $timeout(function () {
                //        if (_.isEmpty($scope.topic) || $scope.topic.isActived()) {
                //            $scope.countdown = COUNTDOWN;
                //            return;
                //        }
                //
                //        if ($scope.countdown > 0) {
                //            $scope.countdown--;
                //            checkTimeout();
                //        }
                //    }, 1000);
                //
                //};

                $scope.$watch('topic', function (newValue, oldValue) {
                    if(newValue && newValue._id){
                        //$scope.countdown = COUNTDOWN;
                        $scope.checkedOpt = -1;
                        //checkTimeout();
                    }
                });

                $scope.check = function (opt) {
                    //if ($scope.topic.isActived()) {
                    //    return;
                    //}
                    //$scope.topic.$check({option: opt}, function () {
                    //    $scope.$emit('topicDone', $scope.topic);
                    //});
                    socketSrv.topicCheckOpt(opt);
                    $scope.checkedOpt = opt;
                };

            }
        }
    });
});
