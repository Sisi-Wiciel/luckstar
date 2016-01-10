define([
    'angular',
    'lodash',
    'app'
], function (angular, _, app) {
    "use strict";
    app.directive('textLimit', function ($timeout, $parse) {
        return {
            link: function (scope, ele, attrs) {
                var len = attrs.textLimit;
                $(ele).on('keydown', function(event){
                    if($(this).val().length > len && event.keyCode != 8){
                        event.preventDefault();
                    }
                });
            }
        };
    });
});