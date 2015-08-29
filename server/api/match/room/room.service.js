"use strict";

var _ = require('lodash');
var db = require('../../redis/redis.service');
var log = require('../../../log');

exports.list = function(){
    //var fakeData = [{
    //    title: 'test1',
    //    admin: 'aaaaa',
    //    users: [
    //        {username: 'test1', id: 'aaaaa', status: 0},
    //        {username: 'test2', id: 'bbbbb', status: 0},
    //    ],
    //    id: 'roomidsaaaa',
    //    status: 0,
    //    mode: 0,
    //    create: new Date(),
    //}, {
    //    title: 'test2',
    //    admin: 'aaaaa',
    //    users: [
    //        {username: 'test1aaaa', id: 'aaaaa', status: 1},
    //        {username: 'test2aaaa', id: 'bbbbb', status: 0},
    //    ],
    //    id: 'fsdafsadfsadf',
    //    status: 1,
    //    mode: 1,
    //    create: new Date(),
    //}];
    return db.list("rooms");

}


exports.save = function(room){
    return db.save("rooms", room);
}