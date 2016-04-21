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
    // extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
    extraClasses: 'messenger-fixed messenger-on-top',
    theme: 'future'
  };
  var messenger;
  var confirmMessenger;

  function _updateMessage(messageObj) {
    if (messenger) {
      messenger.update(messageObj);
    } else {
      messenger = Messenger().post(_.assign({
        showCloseButton: true,
        hideAfter: 5
      }, messageObj));
    }
  }

  this.notify = function(content) {
    _updateMessage({
      message: content,
      type: 'success'
    });
  };

  this.error = function(content) {
    _updateMessage({
      message: content,
      type: 'error'
    });
  };

  this.confirm = function(content) {
    if (confirmMessenger) {
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

