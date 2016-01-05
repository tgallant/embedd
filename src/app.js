/*global require, location*/

import 'babel-polyfill';
import './scss/app.scss';
import mustache from 'mustache';
import {redditConstructor} from './reddit';
import {hnConstructor} from './hn';

const mainTemplate = require('./templates/main.html');
const commentTemplate = require('./templates/comment.html');

function contextConstructor() {
	let context = {},
			script = document.currentScript,
			parent = script.parentNode,
			container = document.createElement('div');
		
	context.config = {
		element: container,
		url: location.protocol + '//' + location.host + location.pathname,
		dark: false,
		service: 'reddit',
		both: true,
		loadMore: true,
		infiniteScroll: false,
		limit: 5,
		debug: false
	};
	
	let userConfig = script.innerHTML.length > 0
				? JSON.parse(script.innerHTML.trim())
				: {};
	
	context.config = extend(context.config, userConfig);

	if(typeof context.config.element === 'string') {
		context.config.element = document.querySelector(context.config.element);
	}
	
	context.config.element.className = 'embedd-container';
	
	if(context.config.element === container) {
		parent.insertBefore(container, script);
	}

	if(context.config.loadMore && context.config.infiniteScroll) {
		context.config.loadMore = false;
	}

	context.clients = {};

	if(context.config.both) {
		context.clients.reddit = redditConstructor(context.config);
		context.clients.hn = hnConstructor(context.config);
	}

	if(!context.config.both && context.config.service === 'reddit') {
		context.clients.reddit = redditConstructor(context.config.url);
	}

	if(!context.config.both && context.config.service === 'hn') {
		context.clients.hn = hnConstructor(context.config.url);
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
				context.config.service = 'reddit';
				context.init();
			}, false);
		}
		
		if(hnBtn) {
			hnBtn.addEventListener('click', () => {
				context.config.service = 'hn';
				context.init();
			}, false);
		}

		if(moreBtn) {
			moreBtn.addEventListener('click', () => {
				renderMore(context);
			}, false);
		}

		if(!context.config.loadMore && context.config.infiniteScroll) {
			window.addEventListener('scroll', loadOnScroll, false);
		}
		
	};

	function loadOnScroll() {
		let maxScroll = context.config.element.scrollHeight - document.body.clientHeight;

		if(maxScroll - window.scrollY < 20) {
			window.removeEventListener('scroll', loadOnScroll, false);
			renderMore(context);
		}
	};

	function renderHtml(data) {
		data.redditActive = () => {
			return context.config.service === 'reddit';
		};

		data.hnActive = () => {
			return context.config.service === 'hn';
		};

		if(data.data.next.length === 0) {
			data.config.loadMore = false;
		}
		
		let html = mustache.render(mainTemplate, data, { comment : commentTemplate });

		if(context.config.debug) {
			console.log(data);
		}

		context.config.element.innerHTML = html;
		initListeners();
	};

	function renderMore({ data, config, redditActive }) {
		let template = '{{#comments}}{{> comment}}{{/comments}}',
				element = document.querySelector('.embedd-container .comments');
		
		data.comments = data.next.slice(0, config.limit);
		data.next = data.next.slice(config.limit);
		data.config = config;
		data.hasMore = !!data.next.length;

		if(redditActive) {
			data.redditActive = redditActive;
		}

		let html = mustache.render(template, data, { comment : commentTemplate });
		element.insertAdjacentHTML('beforeend', html);

		if(!data.hasMore) {
			let moreBtn = document.querySelector('.embedd-container .more-btn');

			if(moreBtn) {
				moreBtn.style.display = 'none';
			}
			else {
				window.removeEventListener('scroll', loadOnScroll, false);
			}
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
					{reddit, hn} = context.clients,
					service = context.clients[context.config.service];

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

	context.init = () => {
		genData()
			.then(data => {
				context.hasReddit = data[0];
				if(data.length === 3) {
					context.hasHn = data[1];
				}
				context.data = data[data.length - 1];
				renderHtml(context);
			}, err => {
				throw new Error(err);
			});
	};

	return context;
};

const context = contextConstructor();
context.init();
