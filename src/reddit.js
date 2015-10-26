var Promise = require('promise');

var Reddit = function(url) {
	var base = 'https://www.reddit.com';
	var searchQs = '/search.json?q=url:';
	var redditQuery = base + searchQs + url;
	this.base = base;
	this.data = this.get(redditQuery);
};

Reddit.prototype.get = function(url) {
	return new Promise(function(resolve) {
		var req = new XMLHttpRequest();
		req.open('GET', url);
		req.responseType = 'json';

		req.addEventListener('load', function() {
			resolve(req);
		});

		req.send();
	});
};

Reddit.prototype.decode = function(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

Reddit.prototype.threadUrl = function(sub, id) {
	return this.base + '/r/' + sub + '/comments/' + id + '.json';
};

Reddit.prototype.getThreads = function(ids) {
	var self = this;
	var res = ids.response;

	var activeThreads = res.data.children.filter(function(x) {
		return !!x.data.num_comments;
	});

	var threads = activeThreads.map(function(x) {
		return new Promise(function(resolve) {
			var url = self.threadUrl(x.data.subreddit, x.data.id);
			resolve(self.get(url));
		});
	});

	return Promise.all(threads);
};

Reddit.prototype.comment = function(comment, op, depth) {
	var self = this;
	var cdepth = depth || 0;
	var c = {
		author: comment.author,
		body_html: self.decode(comment.body_html),
		created: comment.created_utc,
		id: comment.id,
		score: comment.score,
		subreddit: op.subreddit,
		permalink: self.base + op.permalink,
		thread: self.base + op.permalink + comment.id,
		replies: null,
		depth: cdepth,
		isEven: function() { return this.depth % 2 === 0; }
	};

	if(comment.replies && comment.replies.data.children.length > 0) {
		var nxtDepth = cdepth + 1;
		c.replies = comment.replies.data.children.map(function(r) {
			return self.comment(r.data, op, nxtDepth);
		});
	}

	return c;
};

Reddit.prototype.parseComments = function(threads) {
	var self = this;
	return new Promise(function(resolve) {
		var cs = threads.map(function(x) {
			var res = x.response;
			var op = res[0].data.children[0].data;
			var comments = res[1].data.children.map(function(c) {
				return self.comment(c.data, op);
			});
			return { op: op, comments: comments };
		});
		resolve(cs);
	});
};

Reddit.prototype.mergeComments = function(comments) {
	return new Promise(function(resolve) {
		var merge = function(score, arr, index) {
			if(index > comments.length - 1) {
				return {
					score: score,
					threads: comments.length,
					comments: arr,
					multiple: function() { return this.threads > 1; }
				};
			}
			var data = comments[index];
			var newScore = score += data.op.score;
			var newComments = arr.concat(data.comments);
			
			return merge(newScore, newComments, index + 1);
		};

		var merged = merge(0, [], 0);
		merged.comments = merged.comments.sort(function(a, b) {
			return b.score - a.score;
		});
		
		resolve(merged);
	});
};

Reddit.prototype.hasComments = function() {
	var self = this;
	return new Promise(function(resolve) {
		self.data.then(function(data) {
			var res = data.response;
			var threads = res.data.children.filter(function(x) {
				return !!x.data.num_comments;
			});
			resolve(!!threads);
		});
	});
};

Reddit.prototype.getComments = function() {
	var self = this;
	return new Promise(function(resolve) {
		self.data
			.then(self.getThreads.bind(self))
			.then(self.parseComments.bind(self))
			.then(self.mergeComments.bind(self))
			.then(resolve);
	});
};

module.exports = Reddit;
