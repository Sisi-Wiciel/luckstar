define([
    'angular',
    'lodash',
    'app',
], function (angular, _, app) {
    "use strict";

    app.service('roomSrv', function ($q, httpq) {

        this.save = function (room) {
            return httpq.post('/api/match/room', room);
        };

        this.get = function(id){
            return httpq.get('/api/match/room/'+id);
        }

    });
});
