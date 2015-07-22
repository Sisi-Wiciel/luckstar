define([
  'angular',
  'app'
], function(angular, app){
  "use strict";

  app.service('authSrv', function(httpq, store, $q, User, $timeout){
    var self = this;

    var currentUser = {};

    if(store.get('token')) {
      currentUser = User.get();
    }

    this.login = function(u){

      return httpq.post('/api/auth', u).then(function(result){
        if(result.token){
          store.set("token", result.token);
          currentUser = User.get();
          return currentUser;
        }else{
          return result.message;
        }
      });
    };

    this.logout = function(){
      store.delete('token');
      currentUser = {};
    };

    this.createUser = function(user){
      return User.save(user,
        function(data) {
          store.set('token', data.token);
          currentUser = User.get();
        },
        function(err) {
          //this.logout();
        }.bind(this)).$promise;
    };

    this.isLoggedIn = function(){
      return currentUser.hasOwnProperty('_id');
    };

    this.getCurrentUser = function(){
      return currentUser;
    };

  });
})
