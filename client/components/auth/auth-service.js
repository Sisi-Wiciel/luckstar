define([
    'angular',
    'app'
], function (angular, app) {
    "use strict";

    app.service('authSrv', function (httpq, store, $q, User, $timeout, socketSrv) {
        var self = this;

        var currentUser = {};

        if (store.get('token')) {
            currentUser = User.get();
        }

        this.login = function (u) {

            return httpq.post('/api/auth', u).then(function (result) {
                if (result.token) {
                    store.set("token", result.token);
                    currentUser = User.get();
                    return currentUser;
                } else {
                    return result.message;
                }
            });
        };

        this.logout = function () {
            store.delete('token');
            socketSrv.userOffline();
            currentUser = {};
        };

        this.createUser = function (user) {
            return User.save(user).$promise;
        };

        this.usernameIsExisted = function (name) {
            return httpq.post('/api/auth/name/', {name: name});
        }

        this.isLoggedIn = function () {
            return currentUser.hasOwnProperty('_id');
        };

        this.getCurrentUser = function () {
            return currentUser;
        };


    });
});
