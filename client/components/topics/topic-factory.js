define([
  'angular',
  'lodash',
  'app',
], function (angular, _, app) {
  "use strict";

  app.factory('Topic', function (httpq, $q, $resource) {
    var self = this;

    //var Topic = $resource('/api/topic/:id/:controller', {
    //  id: '@_id',
    //  controller: '@_controller'
    //}, {
    //  check: {
    //    method: "POST",
    //    params: {
    //      controller: 'checkup',
    //      option: ''
    //    },
    //    transformRequest: function(data){
    //      Topic._topic = data;
    //    },
    //    transformResponse: function (data, header) {
    //      var json = angular.fromJson(data);
    //      _.defaults(json, Topic._topic);
    //
    //      delete Topic._topic;
    //      return json;
    //    }
    //  }
    //});
    function Topic(topic){
        _.assign(this, topic);
    }
    Topic.prototype.isTimeout = function () {
      return this.status == 2;
    };
    Topic.prototype.isCorrect = function () {
      return this.status == 0;
    };
    Topic.prototype.isInCorrect = function () {
      return this.status == 1;
    };

    Topic.prototype.isActived= function () {
      return this.status >= 0;
    };

    return Topic;
  });
});
