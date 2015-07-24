define([
  'angular',
  'lodash',
  'app'
], function (angular, _, app) {
  "use strict";

    app.directive('ngbsForm', function ($timeout) {
      return {
        'template': '<form autocomplete="off" novalidate class="form-horizontal" role="form" name="{{name}}" ng-transclude></form>',
        'restrict': 'E',
        'transclude': true,
        'scope': {
          'submit': "&onSubmit",
          'name': "@"
        },
        'controller': function ($scope) {

          var _target = {},
            self = this;
          //$scope.submitted = false;

          this.getForm = function () {
            return $scope[$scope.name];
          };
          this.submit = function () {

            $scope.$broadcast('submit');
            if (!self.getForm().$invalid) {
              $timeout(function () {
                $scope.submit({"target": _target});
              });
            }
          };
          this.clean = function () {
            $scope.$broadcast('clean');
          };

          this.set = function (name, value) {
            _target[name] = value;
          }
        },
        'link': function () {
        }
      };
    })
    .directive('ngbsFieldset', function () {
      return {
        'require': '^ngbsForm',
        'restrict': 'E',
        'replace': true,
        'scope': {
          name: '@',
          label: '@',
          type: '@',
          required: '=',
          options: '=',
          equal: '@'
        },
        'transclude': true,
        'controller': function ($scope) {
          this.invaild = function (type) {
            var _type = type;
            switch (type) {
              case 'min':
                _type = "minlength";
                break;
              case 'max':
                _type = "maxlength";
                break;
              case 'equal':
                _type = "equalto";
                break;
            }
            return ($scope.submitted || $scope.filedset.$dirty) && !!$scope.filedset.$error[_type];
          };
        },
        'template': '<div class="form-group has-feedback row" ng-class="{\'has-error\': isError()}">' +
        '<label class="col-sm-2 control-label"></label>' +
        '<div class="col-sm-6">' +
        '<input class="form-control" >' +
        '<div ng-transclude></div>' +
        '</div>' +
        '</div>',
        'compile': function (tElems, tAttrs, form) {

          function setCommonAttr(ele) {
            ele.attr("id", "_id_" + tAttrs.name)
              .attr("name", tAttrs.name)
              .attr("ng-model", "target." + tAttrs.name);
          }

          function setValidationOption(target) {

            tAttrs.min && target.attr("ng-minlength", tAttrs.min);

            tAttrs.max && target.attr("ng-maxlength", tAttrs.max);

            tAttrs.equal && target.attr("equalTo", tAttrs.equal);

            tAttrs.required == "true" && target.attr("required", "");
          }

          var $input = $(tElems).find("input");
          switch (tAttrs.type) {
            case "select":
              var $select = $('<select class="form-control"><option value="">---请选择---</option></select>');

              $select.attr("ng-options", "opt.label for opt in options");
              setCommonAttr($select);
              setValidationOption($select);
              $input.replaceWith($select);
              break;
            default :
              if (tAttrs.type) {
                $input.attr("type", tAttrs.type);
              }
              setCommonAttr($input);
              setValidationOption($input);
          }

          $(tElems).find("label").attr("for", "_id_" + tAttrs.name).html('<span ng-show="required">* </span>' + tAttrs.label);

          return {
            pre: function (scope, elems, attrs, form) {
            },
            post: function (scope, elems, attrs, form) {
              scope.submitted = false;
              var nbsform = form.getForm();
              scope.filedset = nbsform[scope.name];

              scope.isError = function () {
                return (scope.submitted || scope.filedset.$dirty ) && scope.filedset.$invalid;
              };

              scope.$on('submit', function (event) {
                scope.submitted = true;
                scope.target && form.set(tAttrs.name, scope.target[tAttrs.name]);

              });

              scope.$on('clean', function () {
                scope.target && (scope.target[tAttrs.name] = "");
              });
            }
          }
        }
      };
    })
    .directive('invaildMessage', function () {
      return {
        'restrict': 'E',
        'require': '^ngbsFieldset',
        'replace': true,
        'transclude': true,
        'template': '<span ng-show="invaild()" ng-transclude></span>',
        'scope': {
          'type': '@'
        },
        'link': function (scope, element, attrs, field) {
          scope.invaild = function () {
            return field.invaild(scope.type)
          };
        }
      };
    })
    .directive('ngbsController', function () {
      return {
        'restrict': 'E',
        'require': '^ngbsForm',
        'replace': true,
        'scope': {},
        'transclude': true,
        'template': '<div class="form-group">' +
        '<div class="col-sm-offset-2 col-sm-8">' +
        '<button class="btn btn-info" type="button" ng-click="submit()">提交</button> ' +
        '<button class="btn btn-default" type="button" ng-click="reset()">重置</button>' +
        '</div>' +
        '</div>',
        'link': function (scope, element, attrs, form) {
          scope.submit = form.submit;
          scope.reset = form.clean;
        }
      };
    })
    .directive('equalto', function () {
      return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
          var preNode = 'input[name="' + attrs.equalto + '"]';
          elem.add(preNode).on('keyup', function () {
            scope.$apply(function () {
              ctrl.$setValidity('equalto', elem.val() === $(preNode).val());
            });
          });
        }
      };
    });

})
