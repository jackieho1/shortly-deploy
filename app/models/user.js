var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');

var userSchema = mongoose.Schema ({
  username: { type: String, unique: true },
  password: String
});

var User = mongoose.model('User', userSchema);

User.comparePassword = function(attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    callback(isMatch);
  });
};

var hashPassword = function() {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
    });
};

userSchema.pre('save', function (next) {
  this.password = hashPassword();
  next();
});


module.exports = User;