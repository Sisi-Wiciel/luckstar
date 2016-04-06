'use strict';

module.exports = ['$timeout', 'fileSrv', function($timeout, fileSrv) {
  return {
    template: require('./topic-preview.html'),
    scope: {
      image: '=',
      topic: '='
    },
    controller: function() {
    },
    link: function(scope, elem) {
      var $imageContaner = $(elem).find('.image-container');
      var containerHeight = $imageContaner.height();
      var containerWidth = $imageContaner.width();
      var containerRatio = containerWidth / containerHeight;

      $(elem).on('dragover drop', function() {
        event.preventDefault();
        return false;
      });

      var previewFile = function(file) {
        if (file && fileSrv.setFile(file)) {
          fileSrv.readFileForPreview().then(function(data) {
            var $img = $('<img src="' + data + '"/>');
            $imageContaner.find('.image').empty().append($img);

            var imgWidth = $img.width();
            var imgHeight = $img.height();
            var imgRatio = imgWidth / imgHeight;

            if (containerRatio > imgRatio) {
              var showWidth = containerHeight * imgRatio;
              $img.width(showWidth * 0.95);
            } else {
              var showHeight = containerWidth / imgRatio;
              $img.height(showHeight * 0.95);
            }
          });
        }
      };

      scope.initImageContainer = function() {
        var fileSelector;

        $imageContaner
        .on('dragover', function() {
          $(this).addClass('focus');
          return false;
        })
        .on('drop', function(event) {
          $(this).removeClass('focus');
          previewFile(event.originalEvent.dataTransfer.files[0]);
          return false;
        }).click(function(e) {
          if ($(e.target).hasClass('remove-btn')) {
            return;
          }
          fileSelector.trigger('click');
        });

        fileSelector = $('<input type="file" style="display: none"/>');
        fileSelector.on('change', function(e) {
          previewFile(e.originalEvent.target.files[0]);
        });
        $(elem).after(fileSelector);
      };

      scope.initImageContainer();
    }
  };
}];
