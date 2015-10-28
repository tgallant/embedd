var mustache = require('mustache');
var embedd = require('./src/embedd');
var css = require('./src/scss/app.scss');
var mainTemplate = require('./src/templates/main.html');
var commentTemplate = require('./src/templates/comment.html');

var Context = function() {
	this.config = {
		element: document.currentScript,
		url: location.protocol + '//' + location.host + location.pathname,
		service: 'reddit',
		both: true
	};
	
	var userConfig = this.config.element.innerHTML.length > 0
				? JSON.parse(this.config.element.innerHTML.trim())
				: {};
	
	this.config = this.extend(this.config, userConfig);
	console.log(this);
};

Context.prototype.extend = function(o1, o2) {
	var result={};
	for(var key in o1) result[key]=o1[key];
	for(var key in o2) result[key]=o2[key];
	return result;
};

Context.prototype.renderHtml = function(data) {
	var self = this.config;
	var parent = self.element.parentNode;
	var container = document.createElement('div');
	var html = mustache.render(mainTemplate, data, { comment : commentTemplate });

	console.log(data);

	container.className = 'embedd-container';
	container.innerHTML = html;
	parent.insertBefore(container, self.element);
};

Context.prototype.hideChildren = function(e) {
	var el = e.target;
	var parentComment = el.parentNode.parentNode.parentNode;
	parentComment.classList.toggle('closed');
};

Context.prototype.init = function() {
	var self = this;
	var e = new embedd(self.config);
	e.fetch()
		.then(function(data) {
			self.renderHtml(data);

			var hideButtons = document.getElementsByClassName('hideChildrenBtn');

			for(var i = 0; i < hideButtons.length; i++) {
				hideButtons[i].addEventListener('click', self.hideChildren, false);
			}
		});
};

new Context().init();
