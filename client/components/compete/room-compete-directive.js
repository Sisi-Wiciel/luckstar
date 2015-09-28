define([
        'angular',
        'lodash',
        'app'
    ],
    function (angular, _, app) {
        'use strict';

        app.directive('roomCompete', function () {

            return {
                templateUrl: "components/compete/compete.html",
                controller: function ($scope, Topic, socketSrv) {
                    socketSrv.register('topicVerdict', function(obj){
                        $scope.$emit('topicVerdict', obj);
                        $scope.$apply();
                    });

                    socketSrv.register('topicUpdate', function(topic){
                        $scope.topic = new Topic(topic);
                        $scope.$apply();
                    });

                    socketSrv.startCompete();
                },
                link: function (scope, elem, attr) {

                }
            };
        });
    });