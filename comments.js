var q = require('q'),
		http = require('q-io/http'),
		mustache = require('mustache');

module.exports = Comments;

function Comments(html) {
	this.template = html;
};

Comments.prototype.render = function() {
};
