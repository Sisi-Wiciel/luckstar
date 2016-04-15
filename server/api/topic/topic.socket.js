var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var uuid = require('node-uuid');

var topicService = require('../topic/topic.service');
var userService = require('../user/user.service')
var setting = require('../../config/setting');

var saveTopic = function(newTopic, user) {
  return topicService.save(newTopic, user);
}

exports.register = function(socket) {
  var socketSrv = require('../socket/socket.service');

  socketSrv.on(socket, 'topic save', function(newtopic, cb) {
    userService.list(socket.uid).then(function(user) {
      saveTopic(newtopic, user).then(function(topic) {
        cb({
          id: topic._id
        })
      });
    })
  });

  socketSrv.on(socket, 'topic total size', function(cb) {
    topicService.getTotalSize().then(cb);
  });

  socketSrv.on(socket, 'topic get upload policy', function(cb) {
    cb(setting.FILE.UPLOAD_POLICY);
  });

  socketSrv.on(socket, 'topic upload file', function(data, cb) {

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
  });

  socketSrv.on(socket, 'mouse track', function(pixel) {
    if(socket.room){
      socket.io.sockets.in(socket.room).emit('updateMouseTrack', {
        id: socket.uid,
        pixel: pixel
      });
    }

  });
};

exports.deregister = function(socket) {
};
