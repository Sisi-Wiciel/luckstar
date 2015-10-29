define([
    'angular',
    'lodash',
    'app',
    'jquery',
    'text!components/message/message.html',
], function (angular, _, app, $, messagetpl) {
    "use strict";

    app.service('messageCenter', function ($q, $compile, $rootScope, $window, $timeout) {

        var _messages,
            _scope;

        var init = function () {
            _messages = {};
            _scope = $rootScope.$new();
            _scope.messages = [];
            _scope.close = function (index) {
                _.remove(_scope.messages, function(v, n) {
                    return n === index;
                });
            };

            $(".message-center").remove();
            $($window.document.body).append($compile(messagetpl)(_scope));
        }

        init();

        this.push = function (title, content) {
            if (!_messages.hasOwnProperty(title)) {
                _messages[title] = [];
            }
            _messages[title].push(content);

            _show({
                title: title,
                content: content,
                tools: false,
            });
        };


        this.confirm = function(title, content){
            var defer = $q.defer();
            _show({
                title: title,
                content: content,
                tools: true,
                ok: function(index){
                    _scope.close(index)
                    defer.resolve(this);
                },
                cancel: function(index){
                    _scope.close(index);
                    defer.reject(this);
                }
            });
            return defer.promise;
        };

        var _show = function (data) {
            _scope.messages.splice(0, 0, data);
        }
    });
});
