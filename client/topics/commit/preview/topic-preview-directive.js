define([
  'angular',
  'lodash',
  'app',
  'jquery'
],
function(angular, _, app, $) {
  'use strict';

  app.directive('topicPreview', function($timeout, fileSrv) {
    return {
      templateUrl: '/topics/commit/preview/topic-preview.html',
      scope: {
        image: '=',
        topic: '='
      },
      controller: function() {
      },
      link: function(scope, elem) {
        var $imageContaner = $(elem).find('.image-container');

        $(elem).on('dragover drop', function() {
          event.preventDefault();
          return false;
        });

        var previewFile = function(file) {
          if (file && fileSrv.setFile(file)) {
            fileSrv.readFileForPreview().then(function(data) {
              $imageContaner.find('.image').empty().append('<img src="' + data + '"/>');
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
  });
});
