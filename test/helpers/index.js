const isHidden = function (node) {
	return node.className.split(" ").some(function (c) {
		return c === "hidden"
	});
};
