define([
    'angular',
    'app'
], function (angular, app) {
    "use strict";

    app.directive('roomHeader', function () {

        return {
            replace: true,
            templateUrl: 'rooms/room-header.html',
            link: function (scope, ele) {

                //scope.prepareStage = function(){
                //    scope.start = function () {
                //        ele.find(".user-list span").animate({
                //            width: 110,
                //            height: 100
                //        }, 600, "linear");
                //
                //        ele.animate({
                //            marginTop: 0,
                //        }, 300, "linear", function(){
                //            scope.startComplate();
                //        });
                //    }
                //
                //    scope.terminate = function () {
                //        ele.css("margin-top", center);
                //        scope.fakeEnd();
                //    }
                //}

            },
            controller: function ($scope, $timeout, $q, messageCenter, authSrv) {
                $scope.curr = authSrv.getCurrentUser();
                $scope.start = function () {
                    var joinedUserSize = _.filter($scope.room.users, function(u){
                        return u;
                    }).length;
                    if(joinedUserSize > 1 && joinedUserSize <= $scope.room.number){
                        $scope.startComplate();
                    }else{
                        messageCenter.alert("答题人数不符合要求: 人数"+$scope.room.number+"个人.");
                        return $q.reject();
                    }
                }
                $scope.terminate = function(){
                    $scope.terminateComplate();
                }
            }
        }
    });
});
