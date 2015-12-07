import 'babel-polyfill';
import './scss/app.scss';
import mustache from 'mustache';
import redditConstructor from './reddit';
import hnConstructor from './hn';

var mainTemplate = require('./templates/main.html');
var commentTemplate = require('./templates/comment.html');

function contextConstructor() {
	var self = {};
	var script = document.currentScript;
	var parent = script.parentNode;
	var container = document.createElement('div');
	
	container.className = 'embedd-container';
	parent.insertBefore(container, script);
	
	self.config = {
		element: container,
		url: location.protocol + '//' + location.host + location.pathname,
		dark: false,
		service: 'reddit',
		both: true
	};
	
	var userConfig = script.innerHTML.length > 0
				? JSON.parse(script.innerHTML.trim())
				: {};
	
	self.config = extend(self.config, userConfig);

	self.clients = {};

	if(self.config.both) {
		self.clients.reddit = redditConstructor(self.config.url);
		self.clients.hn = hnConstructor(self.config.url);
	}

	if(!self.config.both && self.config.service === 'reddit') {
		self.clients.reddit = redditConstructor(self.config.url);
	}

	if(!self.config.both && self.config.service === 'hn') {
		self.clients.hn = hnConstructor(self.config.url);
	}

	function extend(o1, o2) {
		var result={};
		for(var key in o1) result[key]=o1[key];
		for(var key in o2) result[key]=o2[key];
		return result;
	};

	function initListeners() {
		var hideButtons = document.querySelectorAll('.embedd-container .hideChildrenBtn');
		var redditBtn = document.querySelector('.embedd-container .reddit-btn');
		var hnBtn = document.querySelector('.embedd-container .hn-btn');

		for(var i = 0; i < hideButtons.length; i++) {
			hideButtons[i].addEventListener('click', hideChildren, false);
		}

		if(redditBtn) {
			redditBtn.addEventListener('click', function() {
				self.config.service = 'reddit';
				self.init();
			}, false);
		}
		
		if(hnBtn) {
			hnBtn.addEventListener('click', function() {
				self.config.service = 'hn';
				self.init();
			}, false);
		}
		
	};

	function renderHtml(data) {
		data.redditActive = function() {
			return self.config.service === 'reddit';
		};

		data.hnActive = function() {
			return self.config.service === 'hn';
		};
		
		var html = mustache.render(mainTemplate, data, { comment : commentTemplate });

		console.log(data);

		self.config.element.innerHTML = html;
		initListeners();
	};

	function hideChildren(e) {
		var el = e.target;
		var parentComment = el.parentNode.parentNode.parentNode;
		parentComment.classList.toggle('closed');
	};

	function genData() {
		var services = function() {
			var serviceArray = [];
			var {reddit, hn} = self.clients;
			var service = self.clients[self.config.service];

			if(reddit) {
				serviceArray.push(reddit.hasComments());
			}

			if(hn) {
				serviceArray.push(hn.hasComments());
			}

			serviceArray.push(service.getComments());
			
			return serviceArray;
		};

		var arr = services();
		
		return Promise.all(arr);
	};

	self.init = function() {
		genData()
			.then(function(data) {
				self.hasReddit = data[0];
				if(data.length === 3) {
					self.hasHn = data[1];
				}
				self.data = data[data.length - 1];
				renderHtml(self);
			});
	};

	return self;
};

var context = contextConstructor();
context.init();
