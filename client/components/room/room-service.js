define([
    'angular',
    'lodash',
    'app'
], function (angular, _, app) {
    "use strict";

    app.service('roomSrv', function ($q, httpq) {

        this.save = function (room) {
            return httpq.post('/api/room', room);
        };

        this.get = function(id){
            return httpq.get('/api/room/'+id);
        }

        this.fillRoomUsers = function(room){
            if(room){
                if(room.number > room.users.length){
                    room.users = room.users.concat(_.fill(Array(room.number - room.users.length), null));
                    room.full = false;
                }else{
                    room.full = true;
                }
            }
        }
    });
});
