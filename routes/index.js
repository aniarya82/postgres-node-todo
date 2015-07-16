var express = require('express');
var router = express.Router();

var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
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

module.exports = router;
