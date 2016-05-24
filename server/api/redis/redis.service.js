var _ = require('lodash');
var Topic = require('../topic/topic.model');
var User = require('../user/user.model');
var log = require('../../log');

var Promise = require('bluebird');
var LOCK = require("redis-lock");

module.exports = {
  initData: function(db) {
    var self = this;
    this.init(db);

    db.on('ready', function() {
      var userService = require("../user/user.service");

      self.clean().then(function(){
        Promise.map(User.find().exec(), function(user){
          return userService.add(user);
        });

        Promise.map(Topic.find().exec(), function(topic){
          db.sadd("topics", JSON.stringify(topic.toObject()));
        });
      });
    });
  },
  clean: function(){
    return Promise.map(this.db.keys('*'), function(key){
      return this.db.del(key);
    }.bind(this));
  },
  init: function(db) {
    this.db = db;
    this.lock = LOCK(this.db._redisClient);
    this.LOCK_KEY = "luckstart_lock";

    db.on('error', function(error) {
      log.error("DB problem:", error);
    })
  },

  exists: function(key) {
    return this.db.exists(key).then(function(result) {
      return result === 0;
    })
  },
  size: function(key) {
    return this.db.scard(key);
  },
  random: function(key, number) {
    return this.db.srandmember(key, number);
  },
  save: function(key, value) {
    return this.db.set(key, value);
  },
  list: function(key) {
    return this.db.get(key);
  },
  saveOrUpdateObj: function(key, obj, setFun) {
    var id_ = _.isString(obj) ? obj : obj.id;
    var key_ = key + ":" + id_;
    var self = this;

    if (setFun && _.isFunction(setFun)) {
      log.debug("REDIS-CAS-LOCK: [%s] = ", key_, id_);

      return new Promise(function(resolve, reject) {
        self.lock(self.LOCK_KEY, function(done) {
          self.listObj(key, id_).then(function(lockedObj) {
            if (lockedObj) {
              Promise.resolve(setFun(lockedObj)).then(function(obj_) {
                if(_.isEmpty(obj_)) obj_ = lockedObj;
                log.debug("REDIS-CAS-LOCK-UNLOCK: [%s] = ", key_, obj_);

                self.db.hmset(key_, obj_).then(function() {
                  done();
                  resolve(obj_);
                });
              })
            } else {
              done();
              log.error("Cannot save object, because it's not existed with key " + id_);
              reject(obj);
            }

          })
        });
      });
    } else {
      log.debug("REDIS-SAVE: [%s] = ", key_, obj);
      return this.db.hmset(key_, obj).then(function() {
        return obj;
      });
    }
  },
  delete: function(key) {
    log.debug("REDIS-DELETE: [%s]", key);
    return this.db.del(key);
  },
  /**
   * list all redis data by key
   * @param key
   * @param id
   *  null or '': return list null
   *  undifined: return all data
   *  type of array: return list of data
   *  type of string: return only one data
   */
  listObj: function(key, id) {
    var _db = this.db;

    function do_query_db(key) {
      return _db.hgetall(key);
    }

    if (_.isEmpty(key)) {
      return Promise.resolve(null);
    }

    if (id === undefined) {
      return _db.keys(key + ":*").then(function(keys) {
        log.debug("REDIS-LIST-OBJ: [%s] = ", key, keys);
        return Promise.map(keys, function(fullKeyValue) {
          return do_query_db(fullKeyValue);
        });
      });
    }
    else if (_.isEmpty(id)) {
      return Promise.resolve(null);
    }
    else if (_.isString(id)) {
      return do_query_db(key + ":" + id);
    }
    else if (_.isArray(id)) {
      return Promise.map(id, function(idValue) {
        return do_query_db(key + ":" + idValue)
      });
    }
    else {
      return Promise.resolve(null);
    }
  },
  set: function(key, name, value) {
    return this.db.hset(key, name, value);
  }

};

