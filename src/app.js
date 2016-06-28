/*global require, location*/

import './scss/app.scss';
import async from 'async';
import mustache from 'mustache';
import {hnConstructor} from './hn';
import {redditConstructor} from './reddit';

const mainTemplate = require('./templates/main.html');
const commentTemplate = require('./templates/comment.html');

function contextConstructor() {
  let context = {};
  let script = document.currentScript;
  let parent = script.parentNode;
  let container = document.createElement('div');

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
    context.clients.reddit = redditConstructor(context.config);
  }

  if(!context.config.both && context.config.service === 'hn') {
    context.clients.hn = hnConstructor(context.config);
  }

  function extend(o1, o2) {
    let result={};

    for(let key in o1) {
      result[key] = o1[key];
    }
    for(let key in o2) {
      result[key] = o2[key];
    }

    return result;
  }

  function initListeners() {
    let hideButtons = [].slice.call(document.querySelectorAll('.embedd-container .hideChildrenBtn'));
    let redditBtn = document.querySelector('.embedd-container .reddit-btn');
    let hnBtn = document.querySelector('.embedd-container .hn-btn');
    let viewMoreBtns = [].slice.call(document.querySelectorAll('.embedd-container .viewMore'));
    let moreBtn = document.querySelector('.embedd-container .more-btn');

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

  }

  function loadOnScroll() {
    let maxScroll =  document.body.scrollHeight - window.innerHeight;
    if(maxScroll - window.scrollY < 20) {
      window.removeEventListener('scroll', loadOnScroll, false);
      renderMore(context);
    }
  }

  function renderHtml(obj) {
    let data = extend({}, obj);
    data.config = extend({}, obj.config);

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
  }

  function renderMore({ data, config, redditActive }) {
    let template = '{{#comments}}{{> comment}}{{/comments}}';
    let element = document.querySelector('.embedd-container .comments');

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
  }

  function hideChildren(e) {
    let el = e.target;
    let parentComment = el.parentNode.parentNode.parentNode;

    parentComment.classList.toggle('closed');
  }

  function showMoreComments(e) {
    let el = e.currentTarget;
    let parent = el.parentElement;
    let comments = parent.querySelector('.children');

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
  }

  function getDisplayVal(el) {
		if (el.currentStyle) {
			return el.currentStyle.display;
		}
		else {
			return window.getComputedStyle(el, null).getPropertyValue("display");
		}
	}

	context.init = () => {
		let {reddit, hn} = context.clients;
		let service = context.clients[context.config.service];
		let data = {};

		if(hn) {
			data.hasHn = hn.hasComments;
		}

		if(reddit) {
			data.hasReddit = reddit.hasComments;
		}

		data.data = service.getComments;

		async.series(data, (err, result) => {
			result.submitUrl = service.submitUrl;
			context = extend(context, result);
			renderHtml(context);
		});
	};

	return context;
}

const context = contextConstructor();
context.init();
