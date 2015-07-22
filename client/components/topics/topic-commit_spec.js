//define([
//  'angular',
//  'lodash',
//  'require',
//  'app',
//  'angularMocks'
//], function (angular, _, require) {
//  'use strict';
//
//  describe('Directive: topicCommit', function () {
//
//    beforeEach(module('luckStar'));
//
//    var httpBackend, scope, elm;
//
//    beforeEach(inject(function ($injector, $rootScope) {
//      scope = $rootScope.$new();
//      httpBackend = $injector.get('$httpBackend');
//    }));
//
//    function compileDirective(tpl) {
//        var tpl = '<topic-commit></topic-commit>';
//        inject(function($compile) {
//          elm = $compile(tpl)(scope);
//        });
//
//        scope.$digest();
//
//    }
//    it('should existed at last one option on initial', function () {
//      compileDirective();
//      //expect(1).toEqual(elm.find("input").length);
//    });
//
//  });
//});
