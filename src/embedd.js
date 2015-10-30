var Embedd = function(query) {
	this.data = this.get(query);
};

Embedd.prototype.get = function(url) {
	if(!url)
		throw new Error('No URL has been specified');
	
	return new Promise(function(resolve) {
		var req = new XMLHttpRequest();
		req.open('GET', url);
		req.responseType = 'json';

		req.addEventListener('load', function() {
			resolve(req);
		});

		req.send();
	});
};

Embedd.prototype.decode = function(html) {
	if(!html)
		return false;
	
	var txt = document.createElement("textarea");
	txt.innerHTML = html;
	return txt.value;
};

Embedd.prototype.parseDate = function(unix) {

	var now = new Date().getTime() / 1000;

	if(!unix || unix > now)
		return false;
	

	var seconds = now - unix;
	var minutes = Math.floor(seconds / 60);
	var hours = Math.floor(minutes / 60);
	var days = Math.floor(hours / 24);

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

module.exports = Embedd;
