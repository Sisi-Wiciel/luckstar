'use strict';

module.exports = navbarService;

function navbarService() {
  this.menu = [{
    title: '首页',
    icon: 'home',
    link: '/home'
  }, {
    title: '题目',
    icon: 'receipt',
    link: '/home/topic/commit'
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

  this.addItem = function(title, link, icon) {
    if (!_.find(this.menu, {title: title})) {
      this.menu.push({
        title: title,
        link: link,
        icon: icon
      });
    }
  };

  this.getCurrentItem = function(path) {
    var current = _.find(this.menu, {link: path});
    if (_.isEmpty(current)) {
      _.each(this.menu, function(item) {
        if (item.link && _.startsWith(path, item.link)) {
          current = item;
          return true;
        }
      });
    }
    return current;
  };
}
