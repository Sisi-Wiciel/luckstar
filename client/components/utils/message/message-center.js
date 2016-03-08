define([
  'angular',
  'lodash',
  'app',
  'jquery',
  'text!components/utils/message/message-tpl.html'
], function(angular, _, app, $, messagetpl) {
  'use strict';

  app.service('messageCenter', function($q, $compile, $rootScope, $window, $timeout) {
    var _scope;

    var init = function() {
      _scope = $rootScope.$new();
      _scope.dismis = function() {
        _scope.message = null;
        _scope.animation = 'center';
      };
      _scope.dismis();
      $('#dialog-box').remove();
      $($window.document.body).append($compile(messagetpl)(_scope));
    };

    // this.countdown = function(messages) {
    //  var self = this;
    //  if (_.isEmpty(messages)) {
    //    return;
    //  }
    //  var index = 0;
    //  (function countdown() {
    //    $timeout(function() {
    //      if (index < messages.length) {
    //        self._show({
    //          content: '<span>' + messages[index++] + '</span>',
    //          animation: 'countdown'
    //        }, 1000990);
    //        countdown();
    //      }
    //    }, 1000);
    //  })();
    // };

    this.notify = function(content) {
      this._show({
        position: 'right',
        title: '系统信息',
        content: content
      }, 1000 * 10);
    };

    this.error = function(content) {
      var _close = this._show({
        title: '错误',
        content: content,
        ok: function() {
          _close();
        },
        icon: 'fa-exclamation-triangle',
        position: 'center'
      }, -1);
    };

    this.alert = function(content, closeTimeout) {
      var _close = this._show({
        title: '系统提示',
        content: content,
        position: 'center',
        icon: 'fa-bullhorn',
        ok: function() {
          _close();
        }
      }, closeTimeout);
    };

    this.confirm = function(data, position, closeTimeout) {
      var defer = $q.defer();
      var _close = this._show(_.assign(data, {
        position: position,
        ok: function() {
          _close();
          defer.resolve(this);
        },
        cancel: function() {
          _close();
          defer.reject(this);
        }
      }), closeTimeout || 60 * 1000);
      return defer.promise;
    };

    this._show = function(data, autoCloseTimeout) {
      autoCloseTimeout = autoCloseTimeout || 8000;

      _.defaults(data, {
        okText: '确定',
        cancelText: '取消',
        position: 'center',
        animation: 'bounceIn'
      });

      _scope.message = null;

      $timeout(function() {
        _scope.message = data;
      });

      if (this.closePromise) {
        $timeout.cancel(this.closePromise);
      }

      if (autoCloseTimeout > 0) {
        this.closePromise = $timeout(function() {
          _scope.message = null;
        }, autoCloseTimeout);
      }

      return _scope.dismis;
    };

    init();
  });
});
