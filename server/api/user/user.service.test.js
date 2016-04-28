var should = require('chai').should();

var userService = require('./user.service');
describe('api/user/user.service', function() {
  it('should return false when username is unique', function(done) {
    userService.isUniqueName()
    done();
  });
});