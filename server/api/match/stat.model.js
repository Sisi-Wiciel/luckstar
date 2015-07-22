'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var StatSchema = Schema({
  totalNum: {type: Number, default: 0 },
  correctNum: {type: Number, default: 0 },
  incorrectNum: {type: Number, default: 0 },
  timeoutNum: {type: Number, default: 0 },
  point: {type: Number, default: 0 },
  reward: {type: Number, default: 0 },
  startDate: {type: Date, default: Date.now},
  endDate: {type: Date},
});

StatSchema.methods.correct = function(topic){
  this.correctNum ++ ;
  this.point += topic.point;
};

StatSchema.methods.incorrect = function(topic){
  this.incorrectNum ++;
  this.point -= topic.point;
  if(this.point < 0 ){
    this.point = 0;
  }
};

StatSchema.methods.timeout = function(topic){
    this.timeoutNum ++;
};

StatSchema.methods.isComplete = function(){
  return this.totalNum === this.correctNum + this.incorrectNum + this.timeoutNum;
};

module.exports = mongoose.model('Stat', StatSchema);
