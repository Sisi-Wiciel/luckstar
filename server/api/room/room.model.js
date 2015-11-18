"use strict";

var uuid = require('node-uuid');
var moment = require('moment');

function Room (obj, user) {
    this.mode = obj.mode;
    this.title = obj.title;
    this.number = obj.number;
    this.create = moment().format();
    this.id = uuid.v1();
    this.admin = user._id.toString();
    this.status = 0;
    this.users = [user._id.toString()];
    this.readyUsers = [];
}

exports.new = function(obj, user){
    return new Room(obj, user);
};