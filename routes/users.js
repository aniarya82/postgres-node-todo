var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var _ = require('underscore');

var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo';

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

var users = [];

pg.connect(connectionString, function(err, client, done) {
	var query = client.query("SELECT * FROM users ORDER BY id ASC");

	query.on('row', function(row) {
		users.push(row);
	});

	query.on('end', function() {
		client.end();
	});
});

// module.exports = router;

module.exports = {
	localStrategy: new LocalStrategy(

		function (username, password, done) {
			// var User = require('./user').user;
			var user = module.exports.findByUsername(username);

			if (!user) {
				return done(null, false, {message: 'Nobody here by that name'});
			}
			if (user.password !== password) {
				return done(null, false, {message: 'Wrong password'});
			}

			return done(null, {username: user.username});
		}
	),

	addUser: function(username, password, callback) {
		// var date = new Date();
		pg.connect(connectionString, function(err, client, done) {
			client.query("INSERT INTO users (username, password) VALUES ($1, $2);", [username, password]);
			if (err) {
				console.log(err);
			};
		});
		var user = {username: username, password: password};
		callback(null, user);
	},

	findAll: function() {
		return _.map(users, function(user) { return _.clone(user); });
	},

	findById: function(id) {
		return _.clone(_.find(users, function(user) { return user.id === id }));
	},

	findByUsername: function(username) {
		return _.clone(_.find(users, function(user) { return user.username === username; }));
	},

	validPassword: function (password) {
		return this.password === password;
	},

	serializeUser: function(user, done) {
		done(null, user);
	},

	deserializeUser: function(obj, done) {
		done(null, obj);
	}
}