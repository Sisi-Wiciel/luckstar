'use strict';
var moment = require('moment');
moment.locale('zh-cn');

module.exports = fromNowDirective;

/* @ngInject */
function fromNowDirective($interval) {
  return {
    restrict: 'A',
    link: function(scope, ele, attr) {
      ele.html(moment(attr.fromNow).fromNow());

      $interval(function() {
        ele.html(moment(attr.fromNow).fromNow());
      }, 5000);
    }
  };
}
