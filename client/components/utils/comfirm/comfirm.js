define([
    'angular',
    'lodash',
    'app',
    'jquery',
    'text!components/utils/comfirm/comfirm-tpl.html'
], function (angular, _, app, $, tmpl) {
    "use strict";
    app.directive('comfirm', function ($compile) {
        return {
            restrict: 'A',
            priority: 0,
            scope: {
                ngClick: '&'
            },
            controller: function($scope){
                $scope.show = false;
                $scope.dismis = function(){
                    $scope.show = false;
                }
            },
            link: function (scope, ele, attr) {

                $("body").append($compile(tmpl)(scope));

                ele.unbind('click').bind('click', function () {
                    ele.addClass("disabled").attr("disabled", "disabled").text(attr.loadingText);

                    scope.content = attr.comfirm;
                    scope.show = true;
                    scope.comfirm = scope.ngClick;
                    scope.$apply();
                });
            }
        }
    })
});