define([
  'angular',
  'app'
], function(angular, app){
  'use strict';

  app.factory('Modal', function ($rootScope, $modal) {

      function openModal(scope, modalClass) {
        var modalScope = $rootScope.$new();
        scope = scope || {};
        modalClass = modalClass || 'modal-default';

        angular.extend(modalScope, scope);

        return $modal.open({
          templateUrl: 'components/modal/modal.html',
          windowClass: modalClass,
          scope: modalScope
        });
      }

      // Public API here
      return {

        confirm: {

          info: function(info, message) {
            info = info || angular.noop;

            return function() {
              var args = Array.prototype.slice.call(arguments),
                infoModel;

              infoModel = openModal({
                modal: {
                  dismissable: true,
                  title: '请确认',
                  html: message,
                  buttons: [{
                    classes: 'btn-info',
                    text: '确定',
                    click: function(e) {
                      infoModel.close(e);
                    }
                  }, {
                    classes: 'btn-default',
                    text: '取消',
                    click: function(e) {
                      infoModel.dismiss(e);
                    }
                  }]
                }
              }, 'modal-info');

              infoModel.result.then(function(event) {
                info.apply(event, args);
              });
            };
          }
        }
      };
    });
});

