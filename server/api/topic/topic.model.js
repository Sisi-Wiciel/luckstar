'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var topic = new Schema({
    title: String,
    options: [String],
    active: Boolean,
    point: {type: Number, default: 10},
    creator: String,
    corrector: {type: [Number]},
    image: String
});

module.exports = mongoose.model('Topic', topic);
