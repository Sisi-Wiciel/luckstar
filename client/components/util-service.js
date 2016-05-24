module.exports = function() {
  var formatUnit = function(factor, extArray) {
    return function(size) {
      if (size === null) {
        return '';
      }

      var steps = 0;

      while (Math.abs(size) >= factor) {
        steps++;
        size /= factor;
      }

      return size + extArray[steps];
    };
  };

  this.getUnitedFileSize = function(size) {
    return formatUnit(1024, ['B', 'KB', 'MB'])(size);
  };
};
