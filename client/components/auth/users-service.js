define([
  'angular',
  'app'
], function(angular, app) {
  'use strict';

  app.factory('User', function(httpq) {
    return {
      save: function(newuser) {
        return httpq.post('/api/user/', newuser);
      }
    };
  });
});
