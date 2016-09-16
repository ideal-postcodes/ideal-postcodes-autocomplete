"use strict";

jasmine.getFixtures().fixturesPath = 'base/fixtures';

describe("Controller", () => {
	describe("Error Handling", () => {
		let controller, config;

		beforeEach(() => {
			loadFixtures("basic.html");
			installAjax();
			config = {
				api_key: test_api_key,
				inputField: "#input",
				outputFields: {
					line_1: "#line_1",
					line_2: "#line_2",
					line_3: "#line_3",
					post_town: "#post_town",
					postcode: "#postcode"
				}
			};
			controller = new IdealPostcodes.Autocomplete.Controller(config);
		});

		afterEach(uninstallAjax);

		describe("Failed suggestion", () => {
			it ("leaves message in dropdown", done => {
				const cInterface = controller.interface;
				cInterface._onInput("10 Downing");
				setTimeout(() => {
					expectResponse(responses.autocomplete.error);
					expect(cInterface.suggestionList.children.length).toEqual(1);
					const errorMessage = "Unable to retrieve address suggestions. Please enter your address manually";
					expect(cInterface.suggestionList.children[0].innerHTML).toEqual(errorMessage);
					done();
				}, 250);
			});
		});

		describe("Failed address lookup", () => {
			it ("leaves message in dropdown", done => {
				const cInterface = controller.interface;
				const suggestions = JSON.parse(responses.autocomplete.results.responseText).result.hits;
				cInterface.setSuggestions(suggestions).select(cInterface.suggestionList.children[0]);
				setTimeout(() => {
					expectResponse(responses.udprn.error);
					expect(cInterface.suggestionList.children.length).toEqual(1);
					const errorMessage = "Unable to retrieve your address. Please enter your address manually";
					expect(cInterface.suggestionList.children[0].innerHTML).toEqual(errorMessage);
					done();
				}, 250);
			})
		});
	});
});
