'use strict';

module.exports = ['$timeout', function($timeout) {
  function Typing(opts) {
    this.duration = opts.duration;
    this.$target = $(opts.target);
    this.text = this.$target.text();
    this.delay = opts.delay;
  }

  Typing.fn = Typing.prototype = {
    init: function() {
      this.$target.text('');
      this.duration = this.duration / this.text.length;
    },
    play: function() {
      if (this.text && this.text.length > 0) {
        this.init();

        var self = this;
        var length = this.text.length;
        var textArr = this.text.split('');
        var index = 0;
        setTimeout(function() {
          (function write() {
            setTimeout(function() {
              if (index < length) {
                self.$target.append(textArr[index]);
                index++;
                write();
              }
            }, self.duration);
          })();
        }, this.delay);
      }
    }
  };

  return {
    link: function(scope, element, attrs) {
      $timeout(function() {
        if(!_.isEmpty(attrs.typing)){
          if(!eval(attrs.typing)){
            return
          }
        }
        new Typing({
          target: element,
          duration: attrs.duration || 1000,
          delay: attrs.delay || 0
        }).play();
      });
    }
  };
}];
