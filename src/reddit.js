var Embedd = require('./embedd');

var redditConstructor = function(url) {
	if(!url)
		throw new Error('The Reddit constructor requires a url');

	var base = 'https://www.reddit.com';
	var searchQs = '/search.json?q=url:';
	var redditQuery = base + searchQs + url;

	var self = Embedd(redditQuery);
	
	function threadUrl(sub, id) {
		if(sub && id)
			return base + '/r/' + sub + '/comments/' + id + '.json';
		return false;
	};

	function getThreads(ids) {
		var res = ids.response;

		var activeThreads = res.data.children.filter(function(x) {
			return !!x.data.num_comments;
		});

		var threads = activeThreads.map(function(x) {
			return new Promise(function(resolve) {
				var url = threadUrl(x.data.subreddit, x.data.id);
				resolve(self.get(url));
			});
		});

		return Promise.all(threads);
	};

	function commentConstructor(comment, op, depth) {
		var cdepth = depth || 0;
		var c = {
			author: comment.author,
			author_link: 'https://www.reddit.com/user/' + comment.author,
			body_html: self.decode(comment.body_html),
			created: self.parseDate(comment.created_utc),
			id: comment.id,
			score: comment.score,
			subreddit: op.subreddit,
			permalink: base + op.permalink,
			thread: base + op.permalink + comment.id,
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
				return commentConstructor(r.data, op, nxtDepth);
			});
		}

		return c;
	};

	function parseComments(threads) {
		return new Promise(function(resolve) {
			var cs = threads.map(function(x) {
				var res = x.response;
				var op = res[0].data.children[0].data;
				var comments = res[1].data.children.map(function(c) {
					return commentConstructor(c.data, op);
				});
				return { op: op, comments: comments };
			});
			resolve(cs);
		});
	};

	function mergeComments(comments) {
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

	self.hasComments = function() {
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

	self.getComments = function() {
		return new Promise(function(resolve) {
			self.data
				.then(getThreads)
				.then(parseComments)
				.then(mergeComments)
				.then(resolve);
		});
	};

	return self;
};

module.exports = redditConstructor;
