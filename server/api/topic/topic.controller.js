'use strict';
var _ = require('lodash');
var express = require('express');
var Stat = require('../match/stat.model');
var Topic = require('./topic.model');
var errorHandler = require('express-error-handler');
var auth = require('../auth/auth.service');
var router = express.Router();
var topicSrv = require('./topic.service');

var db = require('../redis/redis.service');

function checkTopic (req, res) {

    var checked = req.query.option || "";

    Topic.findById(req.params.id, "+corrector", function (err, topic) {

        if (err) {
            return errorHandler(res, err)
        }

        var isCorrect = topic.corrector.toString() == checked.toString();
        var status = 0;
        var _stat = req.stat;
        if (!checked) {
            status = 2;
            _stat.timeout(topic);
        } else {
            if (isCorrect) {
                status = 0;
                _stat.correct(topic);
            } else {
                status = 1;
                _stat.incorrect(topic);
            }
        }

        _stat.save();

        return res.status(200)
            .json({
                status: status,
                message: topic.options[topic.corrector],
                stats: _stat
            });
    });

};

function queryTopics (req, res) {

    var stat = req.stat;
    var num = stat ? stat.totalNum : 1;
    topicSrv.list(num).then(function (topics) {
        return res.status(200).json(_.map(topics, JSON.parse));
    });
}

function addTopic (req, res) {
    var topic = req.body;
    if (req.user) {
        topic.creator = req.user;
    }
    topicSrv.save(topic).then(function(topic){
        return res.status(201).json(topic);
    })
};

function getTotalSize (req, res) {
    Topic.find({}, function (err, topics) {
        if (err) return errorHandler(res, err);
        return res.status(200).json({'total': topics.length});
    })
}

exports.queryTopics = queryTopics;
exports.addTopic = addTopic;
exports.checkTopic = checkTopic;
exports.getTotalSize = getTotalSize;
