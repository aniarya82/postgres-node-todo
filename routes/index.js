var express = require('express');
var router = express.Router();

var passport = require('passport');

var path = require('path');

var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo';

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.sendFile(path.join(__dirname, '../views', 'index.html'));
});

/* CREATE single todo action */
router.post('/api/v1/todos', function (req, res) {
	var results = [];

	//Grab data from http requets
	var data = {text: req.body.text, complete: false};

	// Get a Postgres client from th connection pool
	pg.connect(connectionString, function(err, client, done) {

		// SQL query > Insert data
		client.query("INSERT INTO items (text, complete) VALUES ($1, $2);", [data.text, data.complete]);

		// SQL Query > Select data
		var query = client.query("SELECT * FROM items ORDER BY id ASC;");

		// Stream results back one row at a time
		query.on('row', function(row) {
			results.push(row);
		});

		// After all data is returned close the connection and return the results
		query.on('end', function() {
			client.end();
			return res.json(results);
		});

		// Handle errors
		if (err) {
			console.log(err);
		}
	});
});

/* READ Data or todos from items table */
router.get('/api/v1/todos', function (req, res) {

	var results = [];

	// Get a postgres client from the connection pool
	pg.connect(connectionString, function (err, client, done) {

		// SQL query > Select data
		var query = client.query("SELECT * FROM items ORDER BY id ASC;");

		// Send the data one row at a time
		query.on('row', function(row) {
			results.push(row);
		});

		// After all data is returned back, close the connection and return the results
		query.on('end', function() {
			client.end();
			return res.json(results)
		});

		// Handle errors
		if(err) {
			console.log(err);
		}
	});
});

// UPDATE todo in the items table
router.put('/api/v1/todos/:todo_id', function (req, res) {

	var results = [];

	// Grab data from URL parameters
	var id = req.params.todo_id;

	// Grab data from http request
	var data = {text: req.body.text, complete: req.body.complete};

	// Get the postgres client from the connection pool
	pg.connect(connectionString, function (err, client, done) {

		// SQL query > Updata dara
		client.query("UPDATE items SET text=($1), complete=($2) WHERE id=($3)", [data.text, data.complete, id]);

		// SQL query > Select data
		var query = client.query("SELECT * FROM items ORDER BY id ASC");

		// Stream the results back one row at a time
		query.on('row', function(row) {
			results.push(row);
		});

		// After all resiults are steamed bacjk close the connection and return the result
		query.on('end', function() {
			client.end();
			return res.json(results);
		});

		// Handle errors
		if(err) {
			console.log(err);
		}

	});
});

// DELETE todo in the items table
router.delete('/api/v1/todos/:todo_id', function (req, res) {

	var results = [];

	// Grab data from the URL paramaters
	var id = req.params.todo_id;

	// Get the postgres client from the connection pool
	pg.connect(connectionString, function (err, client,done) {

		// SQL query > Delete data
		client.query("DELETE FROM items WHERE id=($1)", [id]);

		// SQL query > Select data
		var query = client.query("SELECT * FROM items ORDER BY id ASC");

		// Stream the results back one row at a time
		query.on('row', function (row) {
			results.push(row);
		});

		// After the result being streamed back, close the connection and return the result back
		query.on('end', function() {
			client.end();
			return res.json(results);
		});

		// Handle errors
		if (err) {
			console.log(err);
		}
	});
});

// REGISTER
router.get('/register', function (req, res) {
	res.render('register', { });
	// res.sendFile(path.join(__dirname, '../views', 'register.html'));
});

router.post('/register', function (req, res) {
	Account.register(new Account({ username: req.body.username }), req.body.password, function(err, account) {
		if (err) {
			console.log(err);
			return res.render('register', {info: "Sorry. That username already exists. Try again."});
		}

		passport.authenticate('local')(req, res, function() {
			console.log("logs for register post data");
			res.redirect('/');
		});
	});
});

//LOGIN
router.get('/login', function(req, res) {
	res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
	res.redirect('/');
});

// LOGOUT
router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

router.get('/ping', function(req, res) {
	res.status(200).send("pong!!");
});

module.exports = router;
