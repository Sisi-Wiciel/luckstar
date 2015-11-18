var _ = require('lodash');
var Topic = require('../topic/topic.model');
var User = require('../user/user.model');
var log = require('../../log');

var Promise = require('bluebird');
var LOCK = require("redis-lock");

module.exports = {

    init: function (db) {

        var self = this;
        this.db = db;
        this.lock = LOCK(this.db._redisClient);
        this.LOCK_KEY = "luckstart_lock";

        db.on('ready', function () {


            db.keys('*').then(function (keys) {

                for (var i = 0, len = keys.length; i < len; i++) {
                    db.del(keys[i]);
                }

            });

            Topic.find(function (err, topics) {
                if (err) {
                    log.error("topic find ", err);
                }
                _.each(topics, function (topic) {
                    db.sadd("topics", JSON.stringify(topic));
                });
            });

            var userService = require("../user/user.service");
            User.find(function (err, users) {
                if (err) {
                    log.error(err);
                }

                _.each(users, function (user) {
                    userService.add(user);
                });
            });
        });

        db.on('error', function(error){
            log.error("db problem:", error);
        })

    },
    random: function (key, number) {
        return this.db.srandmember(key, number);
    },
    save: function(key, value){
        return this.db.set(key, value);
    },
    list: function(key){
        return this.db.get(key);
    },
    saveObj: function (key, obj, setFun) {

        var _key = key + ":" + obj.id;
        var self = this;

        if (setFun && _.isFunction(setFun)) {
            log.debug("REDIS-CAS-LOCK: [%s] = ", _key, obj);

            return new Promise(function (resolve, reject){
                self.lock(self.LOCK_KEY, function (done) {
                    self.listObj(key, obj.id).then(function (Objs) {
                        var lockedObj = _.first(Objs);

                        if(lockedObj){
                            setFun(_.clone(lockedObj)).then(function(_obj){
                                self.db.hmset(_key, _obj).then(function(){
                                    log.debug("REDIS-CAS-LOCK-UNLOCK: [%s] = ", _key, _obj);
                                    done();
                                    resolve(_obj);
                                });
                            })
                        }else{
                            log.error("Cannot save object, because it's not existed with key " + _key);
                            reject(lockedObj);
                        }

                    })
                });
            });

        } else {
            log.debug("REDIS-SAVE: [%s] = ", _key, obj);
            return this.db.hmset(_key, obj).then(function(){
                return obj;
            });
        }

    },
    delete: function (key) {
        log.debug("REDIS-DELETE: [%s]", key);
        return this.db.del(key);
    },
    listObj: function (key, id) {
        id = id || '*';
        var _key = key + ":" + id;
        var _db = this.db;

        return _db.keys(_key).then(function (keys) {
            log.debug("REDIS-LIST-OBJ: [%s] = ", _key, keys);

            return Promise.map(keys, function(key){
                return _db.hgetall(key);
            });
        });

    },
    set: function (key, name, value) {
        return this.db.hset(key, name, value);
    },
    addTopic: function (topic) {
        return this.db.sadd("topics", JSON.stringify(topic));
    },
    setUserSid: function (uid, sid) {
        if (uid && sid) {
            this.set("users:" + uid, "sid", sid);
        }
    }

};

