describe("Utils", () => {
	describe("titleizePostTown", () => {
		const testCases = [
			"Appleby-in-Westmorland",
			"Aboyne",
			"Bo'Ness",
			"Walton on the Naze"
		];
		it ("correctly titleizes post town names", () => {
			testCases.forEach(post_town => {
				const upperCased = post_town.toUpperCase();
				expect(IdealPostcodes.Autocomplete.Utils.titleizePostTown(upperCased))
					.toEqual(post_town);
			});
		});
	});

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
