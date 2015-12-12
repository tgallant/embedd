/*global describe, it*/

import {expect} from 'chai';
import {decode, parseDate, embeddConstructor} from '../src/embedd';
import {redditConstructor} from '../src/reddit';
import {hnConstructor} from '../src/hn';

const url = 'https://www.eff.org/deeplinks/2015/10/closing-loopholes-europes-net-neutrality-compromise';

function isPromise(x) {
	return x instanceof Promise;
};

function isBoolean(x) {
	return typeof x === 'boolean';
};

function verifyComments(obj) {
	return !!(obj.comments && obj.score && obj.threads);
};

describe('decode', () => {

	function escapeHtml(str) {
    let div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
		
    return div.innerHTML;
	};
	
	it('should return valid html', () => {
		let str = '<h1>hello</h1>',
				encoded = escapeHtml(str),
				html = decode(escapeHtml(str));
		
		expect(html).to.equal(str);
	});

	it('should return false if passed an empty string', () => {
		let html = decode('');
		expect(html).to.equal(false);
	});

	it('should return false if passed a falsey value', () => {
		let html = decode(false);
		expect(html).to.equal(false);
	});
	
});

describe('parseDate', function() {

	it('should return false if no value is passed', () => {
		let d = parseDate();
		expect(d).to.equal(false);
	});

	it('should return false if time passed is in the future', () => {
		let now = new Date().getTime() / 1000,
				d = parseDate(now + 50);
		
		expect(d).to.equal(false);
	});
	
	it('should return "a few seconds ago"', () => {
		let now = new Date().getTime() / 1000,
				d = parseDate(now);
		
		expect(d).to.equal('a few seconds ago');
	});

	it('should return "1 minute ago"', () => {
		let now = new Date().getTime() / 1000,
				d = parseDate(now - 60);
		
		expect(d).to.equal('1 minute ago');
	});

	it('should return "2 minutes ago"', () => {
		let now = new Date().getTime() / 1000,
				d = parseDate(now - 120);
		
		expect(d).to.equal('2 minutes ago');
	});

	it('should return "1 hour ago"', () => {
		let now = new Date().getTime() / 1000,
				d = parseDate(now - 3600);
		
		expect(d).to.equal('1 hour ago');
	});

	it('should return "2 hours ago"', () => {
		let now = new Date().getTime() / 1000,
				d = parseDate(now - 7200);
		
		expect(d).to.equal('2 hours ago');
	});

	it('should return "1 day ago"', () => {
		let now = new Date().getTime() / 1000,
				d = parseDate(now - 86400);
		
		expect(d).to.equal('1 day ago');
	});

	it('should return "2 days ago"', () => {
		let now = new Date().getTime() / 1000,
				d = parseDate(now - 172800);
		
		expect(d).to.equal('2 days ago');
	});
	
});

describe('embeddConstructor', () => {

	it('should throw an error if no spec object is passed', () => {
		function embeddTest() {
			return embeddConstructor();
		};
		
		expect(embeddTest).to.throw('No spec object has been specified');
	});

	it('should throw an error if the spec object doesnt have a dataFmt method', () => {
		function embeddTest() {
			let embeddSpec = {};
			
			return embeddConstructor(embeddSpec);
		};

		expect(embeddTest).to.throw('dataFmt method isnt defined');
	});

	it('should throw an error if the spec object doesnt have a commentFmt method', () => {
		function embeddTest() {
			let embeddSpec = {};
			embeddSpec.dataFmt = function() {};
			
			return embeddConstructor(embeddSpec);
		};
		
		expect(embeddTest).to.throw('commentFmt method isnt defined');
	});

	it('should throw an error if the spec object doesnt have a threadFmt method', () => {
		function embeddTest() {
			let embeddSpec = {};
			embeddSpec.dataFmt = function() {};
			embeddSpec.commentFmt = function() {};
			return embeddConstructor(embeddSpec);
		};

		expect(embeddTest).to.throw('threadFmt method isnt defined');
	});
	
});

describe('redditConstructor', () => {

	let reddit = redditConstructor(url);

	it('should throw an error if no url has been specified', () => {
		function redditTest() {
			return redditConstructor();
		};

		expect(redditTest).to.throw('The Reddit constructor requires a url');
	});

	it('should have a data property that is a promise', () => {
		expect(isPromise(reddit.data)).to.equal(true);
	});

	it('should have a hasComments method that returns a boolean', () => {
		reddit.hasComments().then(data => {
			expect(isBoolean(data)).to.equal(true);
		});
	});

	it('should have a getComments method that returns a valid data object', () => {
		reddit.getComments().then(data => {
			expect(verifyComments(data)).to.equal(true);
		});
	});

});

describe('hnConstructor', () => {

	let hn = hnConstructor(url);

	it('should throw an error if no url has been specified', () => {
		function hnTest() {
			return hnConstructor();
		};

		expect(hnTest).to.throw('The HN constructor requires a url');
	});

	it('should have a data property that is a promise', () => {
		expect(isPromise(hn.data)).to.equal(true);
	});

	it('should have a hasComments method that returns a boolean', () => {
		hn.hasComments().then(data => {
			expect(isBoolean(data)).to.equal(true);
		});
	});

	it('should have a getComments method that returns a valid data object', () => {
		hn.getComments().then(data => {
			expect(verifyComments(data)).to.equal(true);
		});
	});

});
