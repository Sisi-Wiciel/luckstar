define([
    'angular',
    'lodash',
    'app',
    'jquery',
    'text!components/utils/message/message-tpl.html',
], function (angular, _, app, $, messagetpl) {
    "use strict";

    app.service('messageCenter', function ($q, $compile, $rootScope, $window, $timeout) {

        var _messages,
            _scope;

        var init = function () {
            _messages = {};
            _scope = $rootScope.$new();
            _scope.messages = [];
            _scope.dismis = function (index) {
                _.remove(_scope.messages, function (v, n) {
                    return n === index;
                });
            };

            $("#dialog-box").remove();
            $($window.document.body).append($compile(messagetpl)(_scope));
        }

        init();
        this.notify = function (content) {
            this.push("系统信息", content, "fa-envelope");
        };
        this.push = function (title, content, icon) {
            if (!_messages.hasOwnProperty(title)) {
                _messages[title] = [];
            }
            _messages[title].push(content);

            _show({
                title: title,
                content: content,
                icon: icon,
            }, 'right');
        };

        this.error = function (content) {
            _show({
                title: "错误",
                content: content,
                position: 'center',
                ok: function (index) {
                    _scope.dismis(index);
                },
                icon: 'fa-exclamation-triangle',
                cls: 'error'
            });
        }
        this.alert = function (content) {
            _show({
                title: "系统提示",
                content: content,
                position: 'center',
                ok: function (index) {
                    _scope.dismis(index);
                },
            });
        }
        this.confirm = function (data, position) {
            var defer = $q.defer();
            _show(_.assign(data, {
                ok: function (index) {
                    _scope.dismis(index);
                    defer.resolve(this);
                },
                cancel: function (index) {
                    _scope.dismis(index);
                    defer.reject(this);
                },
            }), position);
            return defer.promise;
        };

        var _show = function (data, position) {
            //_messages[data.title]
            _scope.position = position || 'center';
            if (!data.icon) {
                data.icon = "fa-envelope";
            }

            //var shown = _.find(_scope.messages, "title", data.title);
            var shown = _.first(_scope.messages);
            if (shown) {
                _.assign(shown, data);
            } else {
                //_scope.messages.splice(0, 0, data);
                _scope.messages.push(data);
            }

        }
    });
});
