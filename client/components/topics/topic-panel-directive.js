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

                socketSrv.register('updateTopicCountdown', function(number){
                    $scope.countdown = number;
                    $scope.$apply();
                });


                $scope.$watch('topic', function (newValue, oldValue) {
                    if(newValue && newValue._id){
                        $scope.checkedOpt = -1;
                    }
                });

                $scope.check = function (opt) {

                    socketSrv.topicCheckOpt(opt);
                    $scope.checkedOpt = opt;
                };

            }
        }
    });
});
