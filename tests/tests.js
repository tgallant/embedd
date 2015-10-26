var assert = require('assert');
var Embedd = require('../src/embedd.js');

describe('Embedd/reddit', function() {
	var config = {
		url: 'https://www.eff.org/deeplinks/2015/10/closing-loopholes-europes-net-neutrality-compromise',
		service: 'reddit',
		both: true
	};
	var e = new Embedd(config);
	it('should return a valid data object', function() {
		e.fetch()
			.then(function(data) {
				assert.equal('object', typeof data);
				assert.equal('object', typeof data.data.comments);
				assert.equal('number', typeof data.data.score);
				assert.equal('number', typeof data.data.threads);
			});
	});
});
