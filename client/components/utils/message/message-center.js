/* global Messenger */
/* eslint no-undef: 2 */
/* eslint new-cap: 0 */

'use strict';

require('./messenger.css');
require('./messenger-theme-future.css');

require('./messenger.min.js');
require('./messenger-theme-future.min.js');

module.exports = ['$q', function($q) {
  Messenger.options = {
    extraClasses: 'messenger-fixed messenger-on-top',
    theme: 'future'
  };

  this.notify = function(content) {
    Messenger().post({
      message: content,
      showCloseButton: true,
      hideAfter: 5,
      singleton: true
    });
  };

  this.error = function(content) {
    Messenger().post({
      message: content,
      type: 'error',
      showCloseButton: true,
      singleton: true,
      hideAfter: 5
    });
  };

  this.confirm = function(content, id) {
    return $q(function(resolve, reject) {
      var msg = Messenger().post({
        message: content,
        showCloseButton: true,
        id: id || 'messenger-confirm',
        actions: {
          ok: {
            label: '确认',
            action: function() {
              resolve();
              msg.hide();
            }
          },
          cancel: {
            label: '取消',
            action: function() {
              reject();
              msg.hide();
            }
          }
        }
      });
    });
  };
}];

