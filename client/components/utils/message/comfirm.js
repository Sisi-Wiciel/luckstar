define([
  'angular',
  'lodash',
  'app'
], function(angular, _, app) {
  'use strict';

  app.directive('comfirm', function() {
    return {
      restrict: 'A',
      scope: {
        ngClick: '&'
      },
      controller: function($scope, messageCenter) {
        $scope.message = messageCenter;
      },
      link: function(scope, ele, attr) {
        var btnText = ele.html();
        var revert = function() {
          ele.removeClass('disabled').removeAttr('disabled').html(btnText);
        };

        ele.unbind('click').bind('click', function() {
          ele.addClass('disabled').attr('disabled', 'disabled').html(attr.loadingText);

          setTimeout(revert, 8000);

          scope.message.confirm({
            title: '提示',
            content: attr.comfirm
          }, 'center', 8000).then(function() {
            scope.ngClick();
          }, function() {
            if (!_.isEmpty(_.trim(btnText))) {
              setTimeout(revert, 1000);
            }
          });
          scope.$apply();
        });
      }
    };
  });
});
