'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var bug = new Schema({
  user: String,
  create: {type: Date, default: Date.now},
  topic: String
});

module.exports = mongoose.model('TopicBug', bug);
