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
            scope: {
                ngClick: '&'
            },
            link: function (scope, ele, attr) {
                var btnText = ele.text();
                ele.unbind('click').bind('click', function () {
                    if (!ele.hasClass("disabled")) {
                        ele.addClass("disabled").attr("disabled", "disabled").text(attr.loadingText);
                        var promised = scope.ngClick();
                        if (promised){
                            promised.then(function(){}, function(){
                                setTimeout(function(){
                                    ele.removeClass("disabled").removeAttr("disabled").text(btnText);
                                }, 1000);

                            })
                        }
                    }
                });
            }
        }
    })
});