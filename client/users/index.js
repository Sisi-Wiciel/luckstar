'use strict';

module.exports = angular.module('luckstar.users', [])
.directive('userChat', require('./chat/user-chat-directive'))
.controller('userLoginCtrl', require('./auth/user-login-controller'))
.controller('userSignupCtrl', require('./auth/user-signup-controller'))
.controller('userlistCtrl', require('./list/user-list-controller'))
.name;
