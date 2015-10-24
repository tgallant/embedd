var fs = require('fs');
var mustache = require('mustache');
var embedd = require('./src/embedd');
var template = fs.readFileSync(__dirname + '/templates/comments.html', 'utf-8');

var extend = function(o1, o2) {
	var result={};
	for(var key in o1) result[key]=o1[key];
	for(var key in o2) result[key]=o2[key];
	return result;
};

var Context = function() {
	this.config = {
		element: document.currentScript,
		url: location.protocol + '//' + location.host + location.pathname,
		service: 'reddit',
		both: true
	};
	
	var userConfig = JSON.parse(this.config.element.innerHTML.trim());
	
	this.config = extend(this.config, userConfig);
	console.log(this);
};

Context.prototype.renderHtml = function(data) {
	var self = this.config;
	var parent = self.element.parentNode;
	var container = document.createElement('div');
	var html = mustache.render(template, data);

	console.log(data);

	container.className = 'embeddit-container';
	container.innerHTML = html;
	parent.insertBefore(container, self.element);
};

Context.prototype.render = function(template) {
	var self = this;
	var e = new embedd(self.config);
	e.fetch()
		.then(function(data) {
			self.renderHtml(data);
		});
};

new Context().render(template);
