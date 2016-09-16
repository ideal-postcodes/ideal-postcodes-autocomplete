"use strict";

jasmine.getFixtures().fixturesPath = 'base/fixtures';

describe("Ideal Postcodes namespace", () => {
	it ("is defined in global namespace", () => {
		expect(IdealPostcodes).toBeDefined();
	});
	it ("defines autocomplete controller", () => {
		expect(IdealPostcodes.Autocomplete).toBeDefined();
	});
});
