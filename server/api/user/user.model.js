var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');
var crypto = require('crypto');

var UserSchema = new Schema({
  username: String,
  email: {type: String, lowercase: true},
  avatar: {type: String, lowercase: true},
  create: {type: Date, default: Date.now},
  friends: [{type: Schema.Types.ObjectId, ref: 'User', default: []}],
  hashedPassword: String,
  point: {type: Number, default: 0},
  salt: String
});

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id
    };
  });

UserSchema.methods = {

  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);

