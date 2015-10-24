var HN = function(url) {
	this.url = url;
};

HN.prototype.hasComments = function() {
	return true;
};

HN.prototype.getComments = function() {
	return [
		{ comment: 'love it'},
		{ comment: 'wow!' }
	];
};

module.exports = HN;
