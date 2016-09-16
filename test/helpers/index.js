const isHidden = node => {
	return node.className.split(" ").some(c => c === "hidden");
};
