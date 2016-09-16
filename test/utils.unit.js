describe("Utils", () => {
	describe("addClass", () => {
		const addClass = IdealPostcodes.Autocomplete.Utils.addClass;
		let node;

		beforeEach(() => {
			node = document.createElement("div");
		});

		it ("adds class to element", () => {
			addClass(node, "foo");
			expect(node.className).toEqual("foo");
		});
		it ("does not duplicate class", () => {
			node.className = "foo";
			addClass(node, "foo");
			expect(node.className).toEqual("foo");
		});
	});

	describe("removeClass", () => {
		const removeClass = IdealPostcodes.Autocomplete.Utils.removeClass;

		let node;

		beforeEach(() => {
			node = document.createElement("div");
		});

		it ("removes class from element", () => {
			node.className = "foo bar";
			removeClass(node, "foo");
			expect(node.className).toEqual("bar");
		});
		it ("does nothing if class is not present", () => {
			node.className = "baz quux";
			removeClass(node, "foo");
			expect(node.className).toEqual("baz quux");
		});
	});
});
