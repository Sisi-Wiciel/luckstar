"use strict";
var db = require('../redis/redis.service');

var Promise = require('bluebird');
var _ = require('lodash');

exports.changeStatus = function(id, status){
    if (id) {
        return db.set("users:" + id, "status", status);
    } else {
        log.error("changeStatus: invalid id", id, status);
    }
};

exports.add = function (user) {
    if (user._id) {
        return db.save("users", {
            id: user._id,
            status: 0,
            username: user.username,
            sid: ''
        })
    } else {
        log.error("addUser: invalid id", user);
    }

};

exports.list = function(ids){
    var self = this;

    if(_.isArray(ids)){
        var promises = _.map(ids, function (id) {
            return db.list("users", id)
        })
        return Promise.all(promises).then(_.flatten);
    }else{
        return db.list("users", ids);
    }

}