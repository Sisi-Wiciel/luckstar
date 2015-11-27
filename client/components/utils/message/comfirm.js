define([
    'angular',
    'lodash',
    'app',
    'jquery',
    'text!components/utils/message/message-tpl.html'
], function (angular, _, app, $, tmpl) {
    "use strict";
    app.directive('comfirm', function ($compile) {
        return {
            restrict: 'A',
            scope: {
                ngClick: '&'
            },
            controller: function ($scope, messageCenter) {
                $scope.message = messageCenter;
            },
            link: function (scope, ele, attr) {
                var btnText = ele.text();
                ele.unbind('click').bind('click', function () {
                    ele.addClass("disabled").attr("disabled", "disabled").text(attr.loadingText);
                    scope.message.confirm({
                        title: '提示',
                        content: attr.comfirm
                    }, 'center').then(function(){
                        scope.ngClick();
                    }, function(){
                        if(!_.isEmpty(_.trim(btnText))){
                            setTimeout(function(){
                                ele.removeClass("disabled").removeAttr("disabled").text(btnText);
                            }, 1000);
                        }

                    })
                    scope.$apply();
                });
            }
        }
    })
});