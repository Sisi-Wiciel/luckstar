var redisSrv = require('../api/redis/redis.service');
var redis = require('then-redis');

module.exports = function () {
    var db = redis.createClient();
    redisSrv.init(db);
};

