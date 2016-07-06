var should = require('chai').should();
var redisService = require('../redis/redis.service');
var utils = require('../../../test/test.utils');
var _ = require('lodash');
var Promise = require('bluebird');
var faker = require('faker');


describe('api/redis/redis.service', function () {
    var key, obj;
    function randomObj() {
        return {
            id: faker.random.uuid(),
            name: faker.name.title(),
            number: '0'
        };
    }

    describe('#saveOrUpdateObj', function () {
        beforeEach(function (done) {
            key = faker.lorem.word();
            obj = randomObj();
            done();
        });

        it('should store obj to redis db', function (done) {
            redisService.saveOrUpdateObj(key, obj).then(function (retObj) {
                retObj.should.deep.equal(obj);
                redisService.listObj(key, obj.id).then(function (listObj) {
                    listObj.should.an('object');
                    listObj.should.deep.equal(obj);
                    done();
                }).catch(done);
            });
        });
        it('should update obj from redis db', function (done) {
            redisService.saveOrUpdateObj(key, obj).then(function (retObj) {
                redisService.saveOrUpdateObj(key, obj, function(lockedObj){
                    lockedObj.number = "2";
                }).then(function (retObj) {
                    obj.number = "2";
                    retObj.should.deep.equal(obj);
                    done();
                }).catch(done);
            });
        });

    });

});
