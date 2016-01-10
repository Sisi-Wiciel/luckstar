define([
    'angular',
    'lodash',
    'app',
    'moment'
], function (angular, _, app, moment) {
    "use strict";
    app.directive('loadingText', function () {
        return {
            restrict: 'A',
            priority: 0,
            scope: {
                ngClick: '&'
            },
            link: function (scope, ele, attr) {
                var btnText = ele.text();
                ele.unbind('click').bind('click', function () {
                    if (!ele.hasClass("disabled")) {
                        setTimeout(function(){
                            ele.addClass("disabled").attr("disabled", "disabled").text(attr.loadingText);
                        }, 200);

                        var promised = scope.ngClick();
                        var revert = function(){
                            setTimeout(function(){
                                ele.removeClass("disabled").removeAttr("disabled").text(btnText);
                            }, 1000);
                        }
                        if (promised){
                            promised.then(revert, revert);
                        }
                    }
                });
            }
        }
    })
});