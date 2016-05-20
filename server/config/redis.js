var redisSrv = require('../api/redis/redis.service');
var redis = require('then-redis');
var process = require('process');

module.exports = function() {
  var db = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || ''
  });
  redisSrv.initData(db);
};

