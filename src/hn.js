var Embedd = require('./embedd');

var hnConstructor = function(url) {
	if(!url)
		throw new Error('The HN constructor requires a url');

	var searchBase = 'http://hn.algolia.com/api/v1/search?restrictSearchableAttributes=url&query=';
	var hnQuery = searchBase + url;
	var base = 'http://hn.algolia.com/api/v1/items/';

	var self = Embedd(hnQuery);

	function threadUrl(id) {
		if(!id) return false;

		return base + id;
	};

	function getThreads(ids) {
		var res = ids.response;

		var activeThreads = res.hits.filter(function(x) {
			return !!x.num_comments;
		});

		var threads = activeThreads.map(function(x) {
			return new Promise(function(resolve) {
				var url = threadUrl(x.objectID);
				resolve(self.get(url));
			});
		});

		return Promise.all(threads);
	};

	function commentConstructor(comment, op, depth) {
		var cdepth = depth || 0;
		var c = {
			author: comment.author,
			author_link: 'https://news.ycombinator.com/user?id=' + comment.author,
			body_html: self.decode(comment.text),
			created: self.parseDate(comment.created_at_i),
			id: comment.id,
			thread: 'https://news.ycombinator.com/item?id=' + comment.id,
			replies: null,
			hasReplies: false,
			depth: cdepth,
			isEven: function() { return this.depth % 2 === 0; }
		};

		if(comment.children && comment.children.length > 0) {
			var nxtDepth = cdepth + 1;

			c.hasReplies = true;
			c.replies = comment.children.map(function(r) {
				return commentConstructor(r, op, nxtDepth);
			});
		}

		return c;
	};

	function parseComments(threads) {
		return new Promise(function(resolve) {
			var cs = threads.map(function(x) {
				var res = x.response;
				var op = res;
				var comments = res.children.map(function(c) {
					return commentConstructor(c, op);
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
				var newScore = score += data.op.points;
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
				var threads = res.hits.filter(function(x) {
					return !!x.num_comments;
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

module.exports = hnConstructor;
