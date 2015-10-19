var css = require('./app.css'),
		fs = require('fs'),
		comments = require('./comments');

var template = __dirname + 'templates/comments.html';

fs.readFile(template, 'utf-8', function(err, html) {
	new comments(html).render();
});
