define([
  'angular',
  'lodash',
  'app',
], function (angular, _, app) {
  "use strict";

  app.service('matchSrv', function ($q, httpq, Topic, matchStat) {
      this.topics = [];
      this.currIndex = -1;
      this.id = "";
      var self = this;

      this.getCurrIndex = function () {
        return this.currIndex;
      };

      this.end = function(){
        return httpq.post('/api/match/end').then(function(result){
          result.duration = (new Date(result.endDate) - new Date(result.startDate) ) / 1000;
          matchStat.set(result);
        });
      };

      this.start = function (number) {
        this.init();
        var defer = $q.defer();
        httpq.post('/api/match/startup/'+number).then(function(result){
          self.id = result.id;
          self.topics = Topic.query(function(){
            defer.resolve(self.topics);
          });
        });
        return defer.promise;
      }

      this.next = function () {
        return this.topics[++this.currIndex];;
      };

      this.init = function(){
        this.currIndex = -1;
        this.topics = [];
      }

      this.init();
    });
});
