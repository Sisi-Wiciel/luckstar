'use strict';

module.exports = authService;

/* @ngInject */
function authService(httpq, store, socketSrv) {
  var currentUser = {};
  this.login = function(u) {
    return httpq.post('/api/auth', u).then(function(result) {
      if (result.token) {
        store.set('token', result.token);
        return result;
      }
      return result.message;
    });
  };

  this.logout = function() {
    store.delete('token');
    currentUser = {};
    socketSrv.close();
  };

  this.createUser = function(newuser) {
    return httpq.post('/api/user/', newuser);
  };

  this.getCurrentUser = function() {
    return currentUser;
  };

  this.updateCurrentUser = function(user) {
    if (_.isEmpty(user)) {
      socketSrv.getUser().then(function(result) {
        _.assign(currentUser, result);
      });
    } else {
      _.assign(currentUser, user);
    }
  };

  this.usernameIsExisted = function(name) {
    return httpq.post('/api/auth/name/', {name: name});
  };
}
