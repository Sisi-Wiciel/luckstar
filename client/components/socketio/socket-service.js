define([
    'socketio',
    'lodash',
    'app',
    'settings'
], function (io, _, app, settings) {

    app.factory('socketSrv', function (httpq, store, $q) {
        var connect = function (namespace) {
            var _socket = settings.socket;
            namespace = namespace || "";
            return io.connect('http://'+_socket.host+':'+_socket.port + namespace);
        };

        return {
            connect: connect,
            init: function (cb) {
                cb = cb || _.noop;
                var self = this;
                this.socket = connect();

                this.socket.on('connect', function () {
                    self.socket.emit('authenticate', {token: store.get('token')});
                    cb();
                });

            },
            // Support user socket service api

            getSocket: function(){
                return this.socket;
            },
            register: function (eventName, cb) {
                var _cb = cb || _.noop;
                this.getSocket().off(eventName);
                this.getSocket().on(eventName, _cb);
            },
            changeUserStatus: function (status) {
                this.getSocket().emit('user change status', status);
            },
            userOnline: function (id) {
                this.getSocket().emit('user online', id);
            },
            userOffline: function () {
                this.getSocket().emit('user offline');
            },
            updateUser: function(){
                this.getSocket().emit('user update');
            },
            // Support room socket service api
            createRoom: function (room, cb) {
                this.getSocket().emit('room create', room, cb || _.noop);
            },
            updateRooms: function () {
                this.getSocket().emit('update rooms');
            },
            joinRoom: function(id){
                this.getSocket().emit('join room', id);
            },
            leaveRoom: function(){
                this.getSocket().emit('leave room');
            },
            sendMsg: function (msg) {
                this.getSocket().emit('send message', msg);
            },
            sendRoomMsg: function (msg) {
                this.getSocket().emit('send room message', msg);
            },
            readyCompete: function(){
                this.getSocket().emit('ready compete');
            },
            unreadyComplate: function(){
                this.getSocket().emit('unready compete');
            },
            terminateCompete: function(){
                this.getSocket().emit('terminate compete');
            },
            startCompete: function(){
                this.getSocket().emit('start compete');
            },
            topicCheckOpt: function(opt){
                this.getSocket().emit('complete check topic', opt);
            },
            getTopic: function(opt){
                this.getSocket().emit('complete get topic');
            },
            getTopicSize: function(){
                return $q(function(resolve, reject) {
                    this.getSocket().emit('topic total size', function(size){
                        resolve(size);
                    });
                }.bind(this));
            },
            getRoomStat: function(opt){
                this.getSocket().emit('room get stat');
            },
            saveTopic: function(topic, cb){
                this.getSocket().emit('topic save', topic, cb || _.noop);
            }
        }
    });

});