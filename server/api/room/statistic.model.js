'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StatisticSchema = Schema({
    correctNum: {type: Number, default: 0},
    incorrectNum: {type: Number, default: 0},
    timeoutNum: {type: Number, default: 0},
    point: {type: Number, default: 0},
    date: {type: Date, default: Date.now},
    user: {type: String}
});

module.exports = mongoose.model('Statistic', StatisticSchema);
