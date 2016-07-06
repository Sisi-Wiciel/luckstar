var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');

var topicService = require('../topic/topic.service');
var roomService = require('../room/room.service');
var userService = require('../user/user.service');
var setting = require('../../config/setting');

function saveTopic(newTopic, user) {
  return topicService.save(newTopic, user);
}

exports.events = {};

exports.events.topicSave = function(socket, newtopic, cb) {
  userService.list(socket.uid).then(function(user) {
    saveTopic(newtopic, user).then(function(topic) {
      cb({
        id: topic._id
      });
    });
  })
};

exports.events.topicBug = function(socket) {
  roomService.list(socket.room).then(function(room){
    topicService.topicBug(socket.uid, room.topicid);
  });
};

exports.events.topicUploadFile = function(socket, data, cb) {

  if (!socket.file_bufs || data.index == 0) {
    socket.file_bufs = [];
    socket.file_buf_length = 0;
  }

  socket.file_buf_length += data.length;
  socket.file_bufs.push(data.buf);

  if (data.index == setting.FILE.UPLOAD_POLICY.BLOCK_NUMBER - 1) {
    var fileName = uuid.v1();
    var _path = path.join(setting.FILE.UPLOAD_DIR, fileName);
    var buffArray = Buffer.concat(socket.file_bufs, socket.file_buf_length);

    fs.writeFile(_path, buffArray, function(err) {
      if (err) {
        console.log(err);
      }

      socket.file_bufs = [];
      socket.file_buf_length = 0;

      topicService.update(data.id, {image: fileName}).then(function() {
        cb({status: 1});
      })

    });
  } else {
    cb({
      index: data.index,
      status: 1
    });
  }
};
exports.events.topicGetUploadPolicy= function(socket, cb) {
  cb(setting.FILE.UPLOAD_POLICY);
};

exports.events.topicTotalSize = function(socket, cb) {
  topicService.getTotalSize().then(cb);
};

exports.events.topicFetch = function(socket, id, cb) {
  topicService.get(id).then(function(topic) {
    cb(topic);
  });
};

exports.deregister = function(socket) {
};
