define([
  'angular',
  'lodash',
  'app',
  'jquery',
  'messenger-theme'
], function(angular, _, app, $, messenger) {
  'use strict';

  app.service('messageCenter', function($q, $compile, $rootScope, $window, $timeout) {
    var _scope;

    Messenger.options = {
      extraClasses: 'messenger-fixed messenger-on-top',
      theme: 'future',
    }
    this.notify = function(content) {
      Messenger().post({
        message: content,
        showCloseButton: true,
        hideAfter: 5,
        singleton: true,
      });
    };

    this.error = function(content) {
      Messenger().post({
        message: content,
        type: 'error',
        showCloseButton: true,
        singleton: true,
        hideAfter: 5,
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
              label: "确认",
              action: function() {
                resolve();
                msg.hide();
              }
            },

            cancel: {
              label: "取消",
              action: function() {
                reject();
                msg.hide();
              }
            }
          }
        });
      });

    };

    this._show = function(data, autoCloseTimeout) {

    };

  });
});
