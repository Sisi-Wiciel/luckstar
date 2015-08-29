"use strict";

var uuid = require('node-uuid');
var moment = require('moment');

function room (obj, user) {
    this.mode = obj.mode;
    this.title = obj.title;
    this.create = moment().format();
    this.id = uuid.v1();
    this.admin = user._id;
    this.status = 0;
    this.users = [user._id];
}

exports.new = function(obj, user){
    return new room(obj, user);
};