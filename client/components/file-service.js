module.exports = ['$q', '$timeout', 'socketSrv', 'messageCenter', 'utilSrv', function($q, $timeout, socketSrv,
                                                                                      messageCenter, utilSrv) {
  var _file;
  var _policy;

  socketSrv.getUploadPolicy().then(function(policy) {
    _policy = policy;
  });

  this.readFileForPreview = function() {
    return $q(function(resolve) {
      var reader = new FileReader();
      reader.onload = function() {
        resolve(reader.result);
      };

      reader.readAsDataURL(_file);
    });
  };

  this.upload = function(data, cb) {
    var eachOfBlockSize = parseInt(_file.size / _policy.BLOCK_NUMBER, 10);

    (function doUpload(index) {
      var startSize = eachOfBlockSize * index;
      var endSize = eachOfBlockSize * (index + 1);
      if (index === _policy.BLOCK_NUMBER - 1) {
        endSize = _file.size;
      }

      var reader = new FileReader();
      reader.onload = function() {
        var buf = reader.result;

        socketSrv.uploadFile(_.assign(data, {
          index: index,
          buf: buf,
          length: buf.byteLength
        })).then(function(result) {
          cb(result);

          if (index < _policy.BLOCK_NUMBER - 1) {
            $timeout(function() {
              doUpload(++index);
            });
          }
        });
      };

      reader.readAsArrayBuffer(_file.slice(startSize, endSize));
    })(0);
  };

  this.setFile = function(file) {
    if (!file) {
      _file = null;
      return false;
    }

    if (file.size > _policy.MAX_SIZE) {
      messageCenter.error('请上传小于' + utilSrv.getUnitedFileSize(_policy.MAX_SIZE) + '的文件');
      return false;
    }
    if (file.size < 1) {
      messageCenter.error('无效图片');
      return false;
    }

    if (_.isEmpty(file.type.match('image/*'))) {
      messageCenter.error('请上传图片类型');
      return false;
    }
    _file = file;
    return true;
  };

  this.getFile = function() {
    return _file;
  };
}];
