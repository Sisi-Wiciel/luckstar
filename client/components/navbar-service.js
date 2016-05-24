'use strict';

module.exports = function() {
  this.menu = [{
    title: '首页',
    icon: 'home',
    link: '/home'
  }, {
    title: '题目',
    icon: 'receipt',
    link: '/home/topic'
  }, {
    title: '个人资料',
    icon: 'account_circle',
    link: ''
  }, {
    title: '设置',
    icon: 'settings',
    link: ''
  }];

  this.removeItem = function(title) {
    _.remove(this.menu, {title: title});
  };

  this.addItem = function(title, link) {
    if (!_.find(this.menu, {title: title})) {
      this.menu.push({
        title: title,
        link: link
      });
    }
  };
  
  this.getCurrentItem = function(path) {
    return _.find(this.menu, {'link': path});
  };
};
