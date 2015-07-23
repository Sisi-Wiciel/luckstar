var redis = require('redis');
var _ = require('lodash');
var Topic = require('../api/topic/topic.model');

var client = redis.createClient();

exports.init = function(){

  client.on('ready', function(){
    Topic.find( function(err, topics){
      if(err){
        console.error(err);
      }
      _.each(topics, function(topic){
        client.SADD("topics", JSON.stringify(topic));
      });

    });

  });
};

exports.randomTopics = function(number, cb){
  var _cb = cb || _.noop;

  client.srandmember("topics", number, function(err, objs){
    if(err){
      console.info(err);
    }else{
      _cb(objs);
    }
  });
};
