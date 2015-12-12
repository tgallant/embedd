/*global require, location*/

import 'babel-polyfill';
import './scss/app.scss';
import mustache from 'mustache';
import {redditConstructor} from './reddit';
import {hnConstructor} from './hn';

const mainTemplate = require('./templates/main.html');
const commentTemplate = require('./templates/comment.html');

function contextConstructor() {
	let self = {},
			script = document.currentScript,
			parent = script.parentNode,
			container = document.createElement('div');
	
	container.className = 'embedd-container';
	parent.insertBefore(container, script);
	
	self.config = {
		element: container,
		url: location.protocol + '//' + location.host + location.pathname,
		dark: false,
		service: 'reddit',
		both: true
	};
	
	let userConfig = script.innerHTML.length > 0
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
		let result={};
		
		for(let key in o1) result[key]=o1[key];
		for(let key in o2) result[key]=o2[key];
		
		return result;
	};

	function initListeners() {
		let hideButtons = [].slice.call(document.querySelectorAll('.embedd-container .hideChildrenBtn')),
				redditBtn = document.querySelector('.embedd-container .reddit-btn'),
				hnBtn = document.querySelector('.embedd-container .hn-btn');

		hideButtons.forEach(x => {
			x.addEventListener('click', hideChildren, false);
		});

		if(redditBtn) {
			redditBtn.addEventListener('click', () => {
				self.config.service = 'reddit';
				self.init();
			}, false);
		}
		
		if(hnBtn) {
			hnBtn.addEventListener('click', () => {
				self.config.service = 'hn';
				self.init();
			}, false);
		}
		
	};

	function renderHtml(data) {
		data.redditActive = () => {
			return self.config.service === 'reddit';
		};

		data.hnActive = () => {
			return self.config.service === 'hn';
		};
		
		let html = mustache.render(mainTemplate, data, { comment : commentTemplate });

		console.log(data);

		self.config.element.innerHTML = html;
		initListeners();
	};

	function hideChildren(e) {
		let el = e.target,
				parentComment = el.parentNode.parentNode.parentNode;
		
		parentComment.classList.toggle('closed');
	};

	function genData() {
		let services = () => {
			let serviceArray = [],
					{reddit, hn} = self.clients,
					service = self.clients[self.config.service];

			if(reddit) {
				serviceArray.push(reddit.hasComments());
			}

			if(hn) {
				serviceArray.push(hn.hasComments());
			}

			serviceArray.push(service.getComments());
			
			return serviceArray;
		};
		
		let arr = services();
		
		return Promise.all(arr);
	};

	self.init = () => {
		genData()
			.then(data => {
				self.hasReddit = data[0];
				if(data.length === 3) {
					self.hasHn = data[1];
				}
				self.data = data[data.length - 1];
				renderHtml(self);
			}, err => {
				throw new Error(err);
			});
	};

	return self;
};

const context = contextConstructor();
context.init();
