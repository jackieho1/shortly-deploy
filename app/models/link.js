var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');

var linkSchema = mongoose.Schema ({
  url: String,
  link: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: Number
});

var Link = mongoose.model('Link', linkSchema);

var createSha = function (url) {
  var shasum = crypto.createHash('sha1');
  shasum.update(url);
  return shasum.digest('hex').slice(0, 5);
};

linkSchema.pre('save', function (next) { 
  this.code = createSha(this.url);
  next();
});

module.exports = Link;