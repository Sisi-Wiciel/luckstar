'use strict';

module.exports = function() {
  this.menu = [{
    title: '首页',
    link: '/home'
  }, {
    title: '题目',
    link: '/home/topic'
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
};
