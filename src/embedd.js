export function decode(html) {
	if(!html)
		return false;
	
	let txt = document.createElement("textarea");
	txt.innerHTML = html;
	
	return txt.value;
};

export function parseDate(unix) {

	let now = new Date().getTime() / 1000;

	if(!unix || unix > now)
		return false;

	let seconds = now - unix,
			minutes = Math.floor(seconds / 60),
			hours = Math.floor(minutes / 60),
			days = Math.floor(hours / 24);

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

export function embeddConstructor(spec) {
	let self = {};
	
	function get(url) {
		if(!url)
			throw new Error('No URL has been specified');
		
		return new Promise(function(resolve) {
			let req = new XMLHttpRequest();
			req.open('GET', url);
			req.responseType = 'json';

			req.addEventListener('load', function() {
				resolve(req);
			});

			req.send();
		});
	};

	function threadUrl(threadObj) {
		let {sub, id} = threadObj;

		if(sub && id) {
			return spec.base + '/r/' + sub + '/comments/' + id + '.json';
		}

		if(!sub && id) {
			return spec.base + id;
		}

		return false;
	};

	function getThreads(data) {
		let activeThreads = data.hits.filter(function(x) {
			return !!x.num_comments;
		});

		var threads = activeThreads.map(function(x) {
			return new Promise(function(resolve) {
				let {id, subreddit} = x,
						url = threadUrl({ sub: subreddit, id: id });
				
				resolve(get(url));
			});
		});

		return Promise.all(threads);
	};

	function commentConstructor(commentObj) {
		let {comment, op, depth} = commentObj,
				cdepth = depth || 0,
				c = spec.commentFmt(comment);
		
		c.depth = cdepth;
		c.subreddit = op.subreddit;

		if(op.permalink) {
			c.permalink = spec.base + op.permalink;
			c.thread = spec.base + op.permalink + comment.id;
		}

		if(comment.children && comment.children.length > 0) {
			let nxtDepth = cdepth + 1;

			c.hasReplies = true;
			c.replies = comment.children.map(function(r) {
				return commentConstructor({ comment: r, op: op, depth: nxtDepth });
			});
		}

		return c;
	};

	function parseComments(threads) {
		return new Promise(function(resolve) {
			var cs = threads.map(function(x) {
				var op = spec.threadFmt(x.response);
				var comments = op.children.map(function(c) {
					return commentConstructor({ comment: c, op: op });
				});
				return { op: op, comments: comments };
			});
			resolve(cs);
		});
	};

	function mergeComments(comments) {
		return new Promise(function(resolve) {
			let merge = function(score, arr, index) {
				if(index > comments.length - 1) {
					return {
						score: score,
						threads: comments.length,
						comments: arr,
						multiple: function() { return this.threads > 1; }
					};
				}
				let data = comments[index],
						newScore = score += data.op.points,
						newComments = arr.concat(data.comments);
				
				return merge(newScore, newComments, index + 1);
			};

			let merged = merge(0, [], 0);
			merged.comments = merged.comments.sort(function(a, b) {
				return b.score - a.score;
			});
			
			resolve(merged);
		});
	};

	self.data = get(spec.query).then(spec.dataFmt);

	self.hasComments = function() {
		return new Promise(function(resolve) {
			self.data.then(function(data) {
				let threads = data.hits.filter(function(x) {
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
