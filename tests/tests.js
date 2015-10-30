var expect = require('chai').expect;
var Embedd = require('../src/embedd');
var Reddit = require('../src/reddit');

var url = 'https://www.eff.org/deeplinks/2015/10/closing-loopholes-europes-net-neutrality-compromise';
var e = new Embedd('http://canihazip.com/s');
var r = new Reddit(url);

describe('Embedd.get', function() {

	it('should throw an error if no URL is specified', function() {
		var getTest = function() {
			return e.get();
		};
		expect(getTest).to.throw('No URL has been specified');
	});
	
	it('should return a promise', function() {
		var instanceTest = e.data instanceof Promise;
		expect(instanceTest).to.equal(true);
	});

	it('should yield an XHR', function() {
		e.data.then(function(data) {
			var instanceTest = data instanceof XMLHttpRequest;
			expect(instanceTest).to.equal(true);
		});
	});

	it('response should not be undefined', function() {
		e.data.then(function(data) {
			var hasResponse = data.response !== undefined;
			expect(hasResponse).to.equal(true);
		});
	});
	
});

describe('Embedd.decode', function() {

	function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
	};
	
	it('should return valid html', function() {
		var str = '<h1>hello</h1>';
		var encoded = escapeHtml(str);
		var html = e.decode(escapeHtml(str));
		expect(html).to.equal(str);
	});

	it('should return false if passed an empty string', function() {
		var html = e.decode('');
		expect(html).to.equal(false);
	});

	it('should return false if passed a falsey value', function() {
		var html = e.decode(false);
		expect(html).to.equal(false);
	});
	
});

describe('Embedd.parseDate', function() {

	it('should return false if no value is passed', function() {
		var d = e.parseDate();
		expect(d).to.equal(false);
	});

	it('should return false if time passed is in the future', function() {
		var now = new Date().getTime() / 1000;
		var d = e.parseDate(now + 50);
		expect(d).to.equal(false);
	});
	
	it('should return "a few seconds ago"', function() {
		var now = new Date().getTime() / 1000;
		var d = e.parseDate(now);
		expect(d).to.equal('a few seconds ago');
	});

	it('should return "1 minute ago"', function() {
		var now = new Date().getTime() / 1000;
		var d = e.parseDate(now - 60);
		expect(d).to.equal('1 minute ago');
	});

	it('should return "2 minutes ago"', function() {
		var now = new Date().getTime() / 1000;
		var d = e.parseDate(now - 120);
		expect(d).to.equal('2 minutes ago');
	});

	it('should return "1 hour ago"', function() {
		var now = new Date().getTime() / 1000;
		var d = e.parseDate(now - 3600);
		expect(d).to.equal('1 hour ago');
	});

	it('should return "2 hours ago"', function() {
		var now = new Date().getTime() / 1000;
		var d = e.parseDate(now - 7200);
		expect(d).to.equal('2 hours ago');
	});

	it('should return "1 day ago"', function() {
		var now = new Date().getTime() / 1000;
		var d = e.parseDate(now - 86400);
		expect(d).to.equal('1 day ago');
	});

	it('should return "2 days ago"', function() {
		var now = new Date().getTime() / 1000;
		var d = e.parseDate(now - 172800);
		expect(d).to.equal('2 days ago');
	});
	
});

describe('Reddit', function() {
	it('should throw an error if it is passed zero values', function() {
		var redditTest = function() {
			return new Reddit();
		};
		expect(redditTest).to.throw('The Reddit constructor requires a url');
	});
	it('should return an instance of Reddit', function() {
		var instanceTest = r instanceof Reddit;
		expect(instanceTest).to.equal(true);
	});

	it('should have a base attribute', function() {
		expect(r.base).to.be.a('string');
	});

	it('should have a data attribute', function() {
		expect(r.data).to.be.a('promise');
	});
	
});

describe('Reddit.threadUrl', function() {

	it('should return false if passed zero values', function() {
		var thread = r.threadUrl();
		expect(thread).to.equal(false);
	});
	
	it('should return false if passed one value', function() {
		var thread = r.threadUrl('CrappyDesign');
		expect(thread).to.equal(false);
	});

	it('should return false if passed two values, one being falsey', function() {
		var thread = r.threadUrl('CrappyDesign', false);
		expect(thread).to.equal(false);
	});

	it('should return false if passed two values, both falsey', function() {
		var thread = r.threadUrl('', '');
		expect(thread).to.equal(false);
	});

	it('should return a valid string if passed two correct values', function() {
		var thread = r.threadUrl('RetroFuturism', '3ppebs');
		var redditUrl = 'https://www.reddit.com/r/RetroFuturism/comments/3ppebs.json';
		expect(thread).to.equal(redditUrl);
	});
	
});

describe('Reddit.getThreads', function() {

	it('should return an array of XHR requests', function(done) {
		r.data
			.then(r.getThreads.bind(r))
			.then(function(data) {
				var xhrFilter = data.filter(function(d) {
					return d instanceof XMLHttpRequest;
				});
				expect(data.length).to.equal(xhrFilter.length);
			})
			.then(done, done);
	});
	
});
