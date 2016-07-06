'use strict';

module.exports = ['$timeout', 'fileSrv', function($timeout, fileSrv) {
  return {
    template: '<topic-panel typeable="false"  topic="topic"></topic-panel>',
    scope: {
      image: '=',
      topic: '='
    },
    controller: function() {
    },
    link: function(scope, elem) {

      // $timeout(function() {
      //   $(elem).on('click', '.image-container', function(event) {
      //     var $imageContainer = $(event.target)
      //   })
      // }, 1000)

      //
      $(elem).on('dragover drop', '.image-container',function() {
       event.preventDefault();
       return false;
      });
      //
      var previewFile = function(file) {
       if (file && fileSrv.setFile(file)) {
         fileSrv.readFileForPreview().then(function(data) {
           var $img = $('<img src="' + data + '"/>');
           $(elem).find('.image-container').empty().append($img);
         });
       }
      };
      //
      scope.initImageContainer = function() {
       var fileSelector;

       $(elem).on('dragover', '.image-container', function() {
         $(this).addClass('focus');
         return false;
       }).on('drop', '.image-container', function(event) {
         $(this).removeClass('focus');
         previewFile(event.originalEvent.dataTransfer.files[0]);
         return false;
       }).on('click', '.image-container', function(e) {
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
