define([
    'socketio',
    'lodash',
    'app'
], function (io, _, app) {

    app.factory('socketSrv', function (httpq, store, $q) {
        var connect = function (namespace) {
            var namespace = namespace || "";
            return io.connect('http://localhost:8889/' + namespace);
        }

        return {
            connect: connect,
            init: function (cb) {
                var cb = cb || _.noop();
                var self = this;
                this.socket = connect();

                this.socket.on('connect', function () {
                    self.socket.emit('authenticate', {token: store.get('token')});
                });
                cb();
            },
            register: function (eventName, cb) {
                var _cb = cb || _.noop;
                this.socket.on(eventName, function (items) {
                    _cb(items);
                });
            },
            userOnline: function (id) {
                this.socket.emit('user online', id);
            },
            userOffline: function () {
                this.socket.emit('user offline');
            },
            updateRooms: function () {
                this.socket.emit('update rooms');
            },
            joinRoom: function(id){
                this.socket.emit('join room', id);
            },
            leaveRoom: function(){
                this.socket.emit('leave room');
            },
            sendMsg: function (from, to, msg) {
                this.socket.emit('send message', {
                    from: from,
                    to: to,
                    content: msg
                });
            },
            sendRoomMsg: function (from, msg) {
                this.socket.emit('send room message', {
                    from: from,
                    content: msg
                });
            }
        }
    });

})