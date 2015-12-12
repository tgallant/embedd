import {decode, parseDate, embeddConstructor} from './embedd';

export function redditConstructor(url) {
	if(!url)
		throw new Error('The Reddit constructor requires a url');

	let embeddSpec = {};
	
	embeddSpec.base = 'https://www.reddit.com';
	embeddSpec.searchQs = '/search.json?q=url:';
	embeddSpec.query = embeddSpec.base + embeddSpec.searchQs + url;

	embeddSpec.dataFmt = function(data) {
		return new Promise(function(resolve) {
			let res = data.response;
			res.hits = res.data.children.map(function(x) {
				x = x.data;
				return x;
			});
			resolve(res);
		});
	};

	embeddSpec.commentFmt = function(comment) {
		return {
			author: comment.author,
			author_link: 'https://www.reddit.com/user/' + comment.author,
			body_html: decode(comment.body_html),
			created: parseDate(comment.created_utc),
			id: comment.id,
			score: comment.score,
			replies: null,
			hasReplies: false,
			isEven: function() { return this.depth % 2 === 0; },
			lowScore: function() { return this.score < 0; }
		};
	};

	embeddSpec.threadFmt = function(thread) {
		let childrenFmt = function(child) {
			child.points = child.score;
			if(child.replies) {
				child.children = child.replies.data.children.map(function(x) {
					x = x.data;
					if(x.replies) {
						x.children = childrenFmt(x);
					}
					return x;
				});
			}
			return child;
		};
		
		let op = thread[0].data.children[0].data;
		op.points = op.score;
		op.children = thread[1].data.children.map(function(x) {
			x = x.data;
			return childrenFmt(x);
		});
		return op;
	};
	
	return embeddConstructor(embeddSpec);

};
