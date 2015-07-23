define([
  'angular',
  'lodash',
  'app'
], function (angular, _, app) {
  "use strict";

  app.factory('matchStat', function (httpq) {
    var stat = {
      currNum: 0
    };

    function queryStat() {
      return httpq.get('/api/match/statistics').then(function (result) {
        _.assign(stat, result);
        return stat;
      });
    };

    return {
      get: function () {
        return stat;
      },
      query: queryStat,
      set: function (stats) {
        _.assign(stat, stats);
      },
      setCurrNum: function(num){
        stat.currNum = num;
      }
    };
  })
})
