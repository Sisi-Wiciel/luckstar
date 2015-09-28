define([
    'angular',
    'lodash',
    'app',
    'moment',
    'jquery'
], function (angular, _, app, moment, $) {
    "use strict";
    app.directive('roomResetHeight', function ($position) {
        return {
            restrict: 'A',
            link: function(scope, ele, attr){
                var $ele = $(ele);
                var totalHeight = $ele.height();

                scope.$on('eleChanged', function (event) {
                    var eleChildrens = $ele.children();

                    $(eleChildrens[0]).find('>div').height(attr.roomResetHeight + "px");
                    $(eleChildrens[1]).find('>div').height(totalHeight-attr.roomResetHeight - 40 + "px");

                });

            }
        }
    });
});