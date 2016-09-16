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

window.responses = {};
