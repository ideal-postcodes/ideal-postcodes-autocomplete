var installAjax = function () {
	if (!stubAjax) return;
	jasmine.Ajax.install();
};

var uninstallAjax = function () {
	if (!stubAjax) return;
	jasmine.Ajax.uninstall();
};

var expectResponse = function (response) {
	if (!stubAjax) return;
	jasmine.Ajax.requests.mostRecent().respondWith(response);
};

var urlRegex = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;

var parseUrl = function (url) {
	var result = urlRegex.exec(url);
	var names = ['url', 'scheme', 'slash', 'host', 'port', 'path', 'query', 'hash'];
	var output = {};
	names.forEach(function (name, i) {
		if (name === "query") {
			output[name] = parseQueryString(result[i]);
		} else {
			output[name] = result[i];
		}
	});
	return output;
};

var parseQueryString = function (queryString) {
	var output = {
		_originalQueryString: queryString
	};
	if (!queryString) return output;
	queryString
		.split("&")
		.map(function (queryPortion) {
			return queryPortion.split("=");
		})
		.forEach(function (queryPortion) {
			var attr = unescape(queryPortion[0]);
			var val = unescape(queryPortion[1]);
			if (!attr || !val) return;
			output[attr] = val;
		});
	return output;
};

window.responses = {};
