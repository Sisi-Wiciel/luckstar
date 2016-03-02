define([
  'angular',
  'lodash',
  'app'
], function(angular, _, app) {
  'use strict';
  app.directive('avatarSelection', function() {
    var baseurl = 'libs/images/avatar/';
    var MAX_INDEX = 12;
    var SUFFIX = '.png';
    return {
      template: '<div class="avatar-selection">' +
      '<span ng-repeat="av in avatars"' +
      '   ng-class="{actived: av == $parent.avatar}"' +
      '   ng-click="select(av)">' +
      '   <img class="avatar" ng-src="{{av}}"/>' +
      '   </span>' +
      '</div>',
      controller: function($scope) {
        $scope.avatars = [];
        $scope.avatar;
        var index = 1;
        for (index = 1; index <= MAX_INDEX; index++) {
          $scope.avatars.push(baseurl + index + SUFFIX);
        }

        $scope.select = function(av) {
          $scope.avatar = av;
          $scope.setAvatar(av);
        };
      }
    };
  });
});
