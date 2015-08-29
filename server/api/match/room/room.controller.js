"use strict";

var service = require('../room/room.service')
var Room = require('../room/room.model')

function newRoom (req, res) {
    var newroom = Room.new(req.body, req.user);
    service.save(newroom).then(function () {
        return res.status(200).json(newroom);
    });
}

exports.new = newRoom;
