define([
  'angular',
  'lodash',
  'app'
], function(angular, _, app) {
  'use strict';

  app.service('navbarSrv', function() {
    this.menu = [{
      title: '首页',
      link: '/home'
    }, {
      title: '题目',
      link: '/home/topic'
    }];

    this.removeItem = function(title) {
      _.remove(this.menu, 'title', title);
    };

    this.addItem = function(title, link) {
      if (!_.find(this.menu, 'link', link)) {
        this.menu.push({
          title: title,
          link: link
        });
      }
    };
  });
});
