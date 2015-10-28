var Reddit = function(url) {
	if(!url)
		throw new Error('The Reddit constructor requires a url');

	var base = 'https://www.reddit.com';
	var searchQs = '/search.json?q=url:';
	var redditQuery = base + searchQs + url;
	this.base = base;
	this.data = this.get(redditQuery);
};

Reddit.prototype.get = function(url) {
	if(!url)
		throw new Error('No URL has been specified');
	
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
	if(!html)
		return false;
	
	var txt = document.createElement("textarea");
	txt.innerHTML = html;
	return txt.value;
};

Reddit.prototype.threadUrl = function(sub, id) {
	if(sub && id)
		return this.base + '/r/' + sub + '/comments/' + id + '.json';
	return false;
};

Reddit.prototype.parseDate = function(unix) {

	var now = new Date().getTime() / 1000;

	if(!unix || unix > now)
		return false;
	

	var seconds = now - unix;
	var minutes = Math.floor(seconds / 60);
	var hours = Math.floor(minutes / 60);
	var days = Math.floor(hours / 24);

	if(days === 1)
		return '1 day ago';
	if(days > 0)
		return days + ' days ago';
	if(hours === 1)
		return '1 hour ago';
	if(hours > 0)
		return hours + ' hours ago';
	if(minutes === 1)
		return '1 minute ago';
	if(minutes > 0)
		return minutes + ' minutes ago';

	return 'a few seconds ago';
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
		created: self.parseDate(comment.created_utc),
		id: comment.id,
		score: comment.score,
		subreddit: op.subreddit,
		permalink: self.base + op.permalink,
		thread: self.base + op.permalink + comment.id,
		replies: null,
		hasReplies: false,
		depth: cdepth,
		isEven: function() { return this.depth % 2 === 0; },
		lowScore: function() { return this.score < 0; }
	};

	if(comment.replies && comment.replies.data.children.length > 0) {
		var nxtDepth = cdepth + 1;

		c.hasReplies = true;
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
			resolve(!!threads.length);
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
