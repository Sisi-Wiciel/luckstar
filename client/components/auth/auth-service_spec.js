define([
  'angular',
  'lodash',
  'app',
  'angularMocks'
], function (angular, _) {
  'use strict';

  var token = "any token string";

  describe('Service: authService', function () {

    beforeEach(module('luckStar'));

    var authSrv, httpBackend, store;

    var mock = {
      username: 'system',
      password: 'System123'
    };

    beforeEach(inject(function ($injector) {
      httpBackend = $injector.get('$httpBackend');
      authSrv = $injector.get('authSrv');
      store = $injector.get('store');
    }));

    afterEach(function($injector) {
      store.deleteAll();
    });

    it('should logged in failed with incorrect auth', function () {
      httpBackend.whenPOST('/api/auth')
        .respond(401, JSON.stringify({message: '用户名或密码错误'}));

      authSrv.login(mock);

      httpBackend.flush();
      expect(authSrv.getCurrentUser()).toEqual({});
    });

    it('should logged in successfully with correct auth', function () {

      httpBackend.whenPOST('/api/auth')
        .respond(200, JSON.stringify({token: token}));

      httpBackend.whenGET('/api/user')
        .respond(200, JSON.stringify(mock));

      authSrv.login(mock);

      httpBackend.flush();
      expect(mock.username).toEqual(authSrv.getCurrentUser().username);
      expect(mock.password).toEqual(authSrv.getCurrentUser().password);
    });


  });
});
