'use strict';
var _ = require('lodash');
var express = require('express');
var Topic = require('../topic/topic.model');
var Stat = require('./stat.model');
var errorHandler = require('express-error-handler');
var router = express.Router();

function end (req, res) {
  var _stat = req.stat;
  if (!_stat.isComplete()) {
    req.session.stat = null;
    return res.status(200);
  } else {
    _stat.endDate = new Date();
    _stat.point += _stat.reward;
    _stat.save();
    return res.status(200).json(_stat);
  }

}

function statistics (req, res) {
  return res.status(200).json(req.stat);
};

function startup (req, res) {
  var topicSize = req.params.number || 10;

  Topic.find(function (err, topics) {
    if (err) {
      return errorHandler(res, err);
    }

    Stat.create(new Stat({
      totalNum: topicSize,
      reward:  topicSize / 2
    }), function (err, stat) {
      if (err) {
        errorHandler(res, err);
      }

      req.session.stat = stat._id;

      var u = req.user;
      u.stats.push(stat);
      u.save(function (err) {
        if (err) {
          return handleError(res, err);
        }
      });

      return res.status(200).json({
        id: stat._id
      });
    })

  });
};

exports.startup = startup;
exports.end = end;
exports.statistics = statistics;
