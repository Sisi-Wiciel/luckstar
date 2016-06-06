'use strict';

module.exports = ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, ele, attr) {
      scope.$on('expanded', function(event, obj) {
        console.info('expanded');
        var $item = $(obj.target).parents('li');
        console.info($item);
        $item.animate({'top': $item.position().top * (-1) + 'px'}, 'slow');
        $item.siblings().animate({'opacity': 0}, 'slow');
      });

      scope.$on('collapsed', function(event, obj) {
        console.info('collapsed');
        var $item = $(obj.target).parents('md-list-item');
        console.info($item);
        $item.animate({'top': '0'}, 'slow');
        $item.siblings().animate({'opacity': 1}, 'slow');
      });
    }
  };
}];
