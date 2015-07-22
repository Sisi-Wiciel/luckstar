define([
  'angular',
  'app'
], function(angular, app){
  "use strict";

  app.factory('User', function ($resource) {
      return $resource('/api/user/:id/:controller', {
          id: '@_id'
        });
    });

})
