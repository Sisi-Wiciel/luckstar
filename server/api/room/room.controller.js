"use strict";

var service = require('./room.service.js');
var Room = require('./room.model.js');
var log = require('../../log');
var _ = require('lodash');
function newRoom (req, res) {
    var newroom = Room.new(req.body, req.user);
    service.save(newroom).then(function () {
        return res.status(200).json(newroom);
    });
}

function getRoom (req, res){
    var id = req.params.id;
    service.list(id).then(function(rooms){
        if(rooms && rooms.length == 1){
            return res.status(200).json(_.first(rooms));
        }else{
            log.error("cannot found room - %s", id);
            return res.status(404).json();
        }
    });
}
exports.new = newRoom;
exports.get = getRoom;
