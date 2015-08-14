var redisSrv = require('../api/redis/redis.service')

module.exports = function(){
  redisSrv.init();
}

