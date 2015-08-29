var _ = require('lodash');
var Topic = require('../topic/topic.model');
var User = require('../user/user.model');
var log = require('../../log');

var RSVP = require('rsvp');

module.exports = {

    init: function (db) {
        var self = this;
        this.db = db;

        db.on('ready', function () {

            db.keys('*').then(function (keys) {

                for (var i = 0, len = keys.length; i < len; i++) {
                    db.del(keys[i]);
                }

            });

            Topic.find(function (err, topics) {
                if (err) {
                    log.error(err);
                }
                _.each(topics, function (topic) {
                    db.sadd("topics", JSON.stringify(topic));
                });
            });

            User.find(function (err, users) {
                if (err) {
                    log.error(err);
                }

                _.each(users, function (user) {
                    db.hmset("users:" + user._id, {
                        id: user._id,
                        status: 0,
                        username: user.username,
                        sid: ''
                    })
                });
            });
        });

    },
    random: function (key, number) {
        return this.db.srandmember(key, number);
    },
    save: function (key, obj) {
        var _key = key + ":" + obj.id
        log.debug("REDIS: save obj [%s] = ", _key, obj);
        return this.db.hmset(_key, obj);
    },
    list: function (key, id) {
        var _key = key + ":" + (id || '*');
        var _db = this.db;

        return new RSVP.Promise(function (resolve, reject) {

            _db.keys(_key).then(function (keys) {
                var promises = [];
                log.debug("REDIS: get list with key [%s] = ", _key, keys);

                _.each(keys, function (key, index) {
                    promises.push(_db.hgetall(key));
                });

                RSVP.all(promises).then(resolve).catch(reject);
            }).catch(reject);
        });

    },
    set: function (key, name, value) {
        return this.db.hset(key, name, value);
    },
    addTopic: function (topic) {
        this.db.sadd("topics", JSON.stringify(topic));
    },
    setUserSid: function (uid, sid) {
        if (uid && sid) {
            this.set("users:" + uid, "sid", sid);
        }
    },

}

