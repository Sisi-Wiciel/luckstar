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
        this.system = function(content){
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
                tools: false,
                icon: icon
            });
        };

        this.alert = function(title, content){

        }
        this.confirm = function(title, content, icon){
            var defer = $q.defer();
            _show({
                title: title,
                content: content,
                tools: true,
                icon: icon,
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
            //_messages[data.title]

            if(!data.icon){
                data.icon = "fa-envelope";
            }

            var shown = _.find(_scope.messages, "title", data.title);
            if(shown){
                _.assign(shown, data);
            }else{
                _scope.messages.splice(0, 0, data);
            }

        }
    });
});
