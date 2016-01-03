import {decode, parseDate, embeddConstructor} from './embedd';

export function hnConstructor(spec) {
	if(!spec) throw new Error('The HN constructor requires a spec object');

	let searchBase = 'http://hn.algolia.com/api/v1/search?restrictSearchableAttributes=url&query=',
			{url, limit} = spec,
			embeddSpec = {};

	embeddSpec.query = searchBase + url;
	embeddSpec.base = 'http://hn.algolia.com/api/v1/items/';
	embeddSpec.limit = limit;

	embeddSpec.dataFmt = (data) => {
		return new Promise((resolve, reject) => {
			let res = data.response;
			res.hits = res.hits.map(x => {
				x.id = x.objectID;
				return x;
			});
			resolve(res);
		});
	};

	embeddSpec.commentFmt = (comment) => {
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

	embeddSpec.threadFmt = (thread) => {
		return thread;
	};

	return embeddConstructor(embeddSpec);

};
