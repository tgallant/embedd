var Promise = require('promise');
var reddit = require('./reddit');
var hn = require('./hn');

var Embedd = function(config) {
	this.url = config.url;
	this.service = config.service;
	this.both = config.both;
	this.clients = {
		reddit: new reddit(config.url),
		hn: new hn(config.url)
	};
};

Embedd.prototype.genData = function() {
	var self = this;
	return Promise.all([
		self.clients.reddit.hasComments(),
		self.clients.hn.hasComments(),
		self.clients[self.service].getComments()
	]);
};

Embedd.prototype.fetch = function() {
	var self = this;
	return new Promise(function(resolve) {
		self.genData()
			.then(function(data) {
				resolve({
					origUrl: self.url,
					service: self.service,
					hasReddit: data[0],
					hasHn: data[1],
					showBoth: self.both,
					data: data[2]
				});
			});
	});
};

module.exports = Embedd;
