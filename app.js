var mustache = require('mustache');
var reddit = require('./src/reddit');
var hn = require('./src/hn');
var css = require('./src/scss/app.scss');
var mainTemplate = require('./src/templates/main.html');
var commentTemplate = require('./src/templates/comment.html');

var Context = function() {
	var script = document.currentScript;
	var parent = script.parentNode;
	var container = document.createElement('div');
	container.className = 'embedd-container';
	parent.insertBefore(container, script);
	
	this.config = {
		element: container,
		url: location.protocol + '//' + location.host + location.pathname,
		dark: false,
		service: 'reddit',
		both: true
	};
	
	var userConfig = script.innerHTML.length > 0
				? JSON.parse(script.innerHTML.trim())
				: {};
	
	this.config = this.extend(this.config, userConfig);

	this.clients = {
		reddit: new reddit(this.config.url),
		hn: new hn(this.config.url)
	};
};

Context.prototype.extend = function(o1, o2) {
	var result={};
	for(var key in o1) result[key]=o1[key];
	for(var key in o2) result[key]=o2[key];
	return result;
};

Context.prototype.initListeners = function() {
	var self = this;
	var hideButtons = document.querySelectorAll('.embedd-container .hideChildrenBtn');
	var redditBtn = document.querySelector('.embedd-container .reddit-btn');
	var hnBtn = document.querySelector('.embedd-container .hn-btn');

	for(var i = 0; i < hideButtons.length; i++) {
		hideButtons[i].addEventListener('click', self.hideChildren, false);
	}

	redditBtn.addEventListener('click', function() {
		self.config.service = 'reddit';
		self.init();
		redditBtn.classList.toggle('active');
		hnBtn.classList.toggle('active');
	}, false);

	hnBtn.addEventListener('click', function() {
		self.config.service = 'hn';
		self.init();
		redditBtn.classList.toggle('active');
		hnBtn.classList.toggle('active');
	}, false);
	
};

Context.prototype.renderHtml = function(data) {
	var self = this.config;
	var html = mustache.render(mainTemplate, data, { comment : commentTemplate });

	console.log(data);

	self.element.innerHTML = html;
	this.initListeners();
};

Context.prototype.hideChildren = function(e) {
	var el = e.target;
	var parentComment = el.parentNode.parentNode.parentNode;
	parentComment.classList.toggle('closed');
};

Context.prototype.genData = function() {
	var self = this;
	return Promise.all([
		self.clients.reddit.hasComments(),
		self.clients.hn.hasComments(),
		self.clients[self.config.service].getComments()
	]);
};

Context.prototype.init = function() {
	var self = this;

	self.genData()
		.then(function(data) {
			self.hasReddit = data[0];
			self.hasHn = data[1];
			self.data = data[2];
			self.renderHtml(self);
		});
};

new Context().init();
