'use strict';

module.exports = function() {
  this.getUnitedFileSize = function(size) {
    return formatUnit(1024, ['B', 'KB', 'MB'])(size);
  };
};

function formatUnit(factor, extArray) {
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
}
