'use strict';

module.exports = angular.module('luckstar.utils', [require('./form').name])
.service('messageCenter', require('./message/message-center'))
.directive('avatarSelection', require('./avatarSelection'))
.directive('countTo', require('./countTo'))
.directive('typing', require('./typing'))
.directive('loadingText', require('./loadingText'))
.directive('textLimit', require('./textLimit'))
.directive('fromNow', require('./fromNow'))
.directive('comfirm', require('./message/comfirm')).name;
