var redisSrv = require('../api/redis/redis.service')

module.exports = {
  init: function () {
    redisSrv.init();
  },

}

