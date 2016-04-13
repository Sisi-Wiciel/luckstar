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
    maxMessages: 9,
    extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
    theme: 'future'
  };
  var notifyMessenger;
  var errorMessenger;
  var confirmMessenger;
  this.notify = function(content) {
    if (!notifyMessenger) {
      notifyMessenger = Messenger().post({
        message: content,
        showCloseButton: true,
        hideAfter: 15
      });
    } else {
      notifyMessenger.update({
        message: content
      })
    }

  };

  this.error = function(content) {
    if (!notifyMessenger) {
      errorMessenger = Messenger().post({
        message: content,
        showCloseButton: true,
        type: 'error',
        hideAfter: 15
      });
    } else {
      errorMessenger.update({
        message: content
      })
    }
  };

  this.confirm = function(content, id) {
    if(confirmMessenger){
      confirmMessenger = null;
    }

    return $q(function(resolve, reject) {
      var confirmMessenger = Messenger().post({
        hideAfter: 50,
        message: content,
        showCloseButton: true,
        actions: {
          ok: {
            label: '确认',
            action: function() {
              resolve();
              confirmMessenger.hide();
            }
          },
          cancel: {
            label: '取消',
            action: function() {
              reject();
              confirmMessenger.hide();
            }
          }
        }
      });
    });
  };
}];

