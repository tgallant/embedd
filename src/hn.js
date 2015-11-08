var Embedd = require('./embedd');

var HN = function(url) {
	if(!url)
		throw new Error('The HN constructor requires a url');

	var searchBase = 'http://hn.algolia.com/api/v1/search?restrictSearchableAttributes=url&query=';
	var hnQuery = searchBase + url;
	this.base = 'http://hn.algolia.com/api/v1/items/';

	Embedd.call(this, hnQuery);
};

HN.prototype = Object.create(Embedd.prototype);
HN.prototype.constructor = HN;

HN.prototype.threadUrl = function(id) {
	if(!id) return false;

	return this.base + id;
};

HN.prototype.getThreads = function(ids) {
	var self = this;
	var res = ids.response;

	var activeThreads = res.hits.filter(function(x) {
		return !!x.num_comments;
	});

	var threads = activeThreads.map(function(x) {
		return new Promise(function(resolve) {
			var url = self.threadUrl(x.objectID);
			resolve(self.get(url));
		});
	});

	return Promise.all(threads);
};

HN.prototype.comment = function(comment, op, depth) {
	var self = this;
	var cdepth = depth || 0;
	var c = {
		author: comment.author,
		body_html: self.decode(comment.text),
		created: self.parseDate(comment.created_at_i),
		id: comment.id,
		replies: null,
		hasReplies: false,
		depth: cdepth,
		isEven: function() { return this.depth % 2 === 0; },
		lowScore: function() { return this.score < 0; }
	};

	if(comment.children && comment.children.length > 0) {
		var nxtDepth = cdepth + 1;

		c.hasReplies = true;
		c.replies = comment.children.map(function(r) {
			return self.comment(r, op, nxtDepth);
		});
	}

	return c;
};

HN.prototype.parseComments = function(threads) {
	var self = this;
	return new Promise(function(resolve) {
		var cs = threads.map(function(x) {
			var res = x.response;
			var op = res;
			var comments = res.children.map(function(c) {
				return self.comment(c, op);
			});
			return { op: op, comments: comments };
		});
		resolve(cs);
	});
};

HN.prototype.mergeComments = function(comments) {
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

HN.prototype.hasComments = function() {
	var self = this;
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

HN.prototype.getComments = function() {
	var self = this;
	return new Promise(function(resolve) {
		self.data
			.then(self.getThreads.bind(self))
			.then(self.parseComments.bind(self))
			.then(self.mergeComments.bind(self))
			.then(resolve);
	});
};

module.exports = HN;
