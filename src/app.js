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
		both: true,
		loadMore: true,
		limit: 5
	};
	
	let userConfig = script.innerHTML.length > 0
				? JSON.parse(script.innerHTML.trim())
				: {};
	
	self.config = extend(self.config, userConfig);

	self.clients = {};

	if(self.config.both) {
		self.clients.reddit = redditConstructor(self.config);
		self.clients.hn = hnConstructor(self.config);
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
				hnBtn = document.querySelector('.embedd-container .hn-btn'),
				viewMoreBtns = [].slice.call(document.querySelectorAll('.embedd-container .viewMore')),
				moreBtn = document.querySelector('.embedd-container .more-btn');

		hideButtons.forEach(x => {
			x.addEventListener('click', hideChildren, false);
		});

		viewMoreBtns.forEach(x => {
			x.addEventListener('click', showMoreComments, false);
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

		if(moreBtn) {
			moreBtn.addEventListener('click', () => {
				renderMore(self);
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

	function renderMore(obj) {
		let {data, config} = obj,
				template = '{{#comments}}{{> comment}}{{/comments}}',
				element = document.querySelector('.embedd-container .comments');
		
		data.comments = data.next.slice(0, config.limit);
		data.next = data.next.slice(config.limit);
		data.hasMore = !!data.next.length;

		let html = mustache.render(template, data, { comment : commentTemplate });
		element.insertAdjacentHTML('beforeend', html);

		if(!data.hasMore) {
			document.querySelector('.embedd-container .more-btn').style.display = 'none';
		}
		
		initListeners();
	};

	function hideChildren(e) {
		let el = e.target,
				parentComment = el.parentNode.parentNode.parentNode;
		
		parentComment.classList.toggle('closed');
	};

	function showMoreComments(e) {
		let el = e.currentTarget,
				parent = el.parentElement,
				comments = parent.querySelector('.children');

		function showComment(c, count) {

			if(c && count !== 3) {
				if(c instanceof Text || getDisplayVal(c) === 'block') {
					showComment(c.nextSibling, count);
				}
				else {
					c.style.display = 'block';
					showComment(c.nextSibling, count + 1);
				}
			}
			else {
				parent.querySelector('.viewMore').style.display = 'none';
			}
		};

		showComment(comments.firstChild, 0);
	};

	function getDisplayVal(el) {
		if (el.currentStyle) {
			return el.currentStyle.display;
		}
		else {
			return window.getComputedStyle(el, null).getPropertyValue("display");
		}
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
