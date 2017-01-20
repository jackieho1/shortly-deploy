var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');


exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  Link.findOne({ url: uri }, function(err, found) {
    if (found) {
      res.status(200).send(found);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        var newLink = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        });
        newLink.save(function(err) {
          res.status(200).send(newLink);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  console.log('LOGIN USER');
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }, function(err, user) {
    if (err) {
      console.log('ERROR IN User.findOne ', err);
      res.redirect('/login');
    } else {
      console.log('USER in User.findOne ', user);
      User.comparePassword(password, function(match) {
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  //console.log('INSIDE SIGN UP USER', req.body.username);

  User.findOne({ username: username }).exec(function(err, user) {
    //console.log('INSIDE USER FIND ONE', err, user);

    if (!user) {
      console.log('ERROR');
      var newUser = new User({
        username: username,
        password: password
      });
      console.log(newUser);
      newUser.save(function(err, newUser) {
        if (err) { 
          res.status(500).send(err); 
        }
        util.createSession(req, res, newUser);
      });
    } else {
      console.log('Account already exists');
      res.redirect('/signup');
    }
  });
};

exports.navToLink = function(req, res) {
  Link.findOne({ code: req.params[0] }, function(err, link) {
    if (err) {
      res.redirect('/');
    } else {
      link.visits++;
      link.save(function(err) {
        res.redirect(link.url);
      });
    }
  });
};