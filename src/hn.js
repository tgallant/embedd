import {decode, parseDate, embeddConstructor} from './embedd';

export function hnConstructor(url) {
	if(!url)
		throw new Error('The HN constructor requires a url');

	let searchBase = 'http://hn.algolia.com/api/v1/search?restrictSearchableAttributes=url&query=',
			embeddSpec = {};

	embeddSpec.query = searchBase + url;
	embeddSpec.base = 'http://hn.algolia.com/api/v1/items/';

	embeddSpec.dataFmt = function(data) {
		return new Promise(function(resolve) {
			let res = data.response;
			res.hits = res.hits.map(function(x) {
				x.id = x.objectID;
				return x;
			});
			resolve(res);
		});
	};

	embeddSpec.commentFmt = function(comment) {
		return {
			author: comment.author,
			author_link: 'https://news.ycombinator.com/user?id=' + comment.author,
			body_html: decode(comment.text),
			created: parseDate(comment.created_at_i),
			id: comment.id,
			thread: 'https://news.ycombinator.com/item?id=' + comment.id,
			replies: null,
			hasReplies: false,
			isEven: function() { return this.depth % 2 === 0; }
		};
	};

	embeddSpec.threadFmt = function(thread) {
		return thread;
	};

	return embeddConstructor(embeddSpec);

};
