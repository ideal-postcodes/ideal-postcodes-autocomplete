"use strict";

jasmine.getFixtures().fixturesPath = 'base/fixtures';

describe("Controller", () => {
	beforeEach(() => {
		loadFixtures("basic.html");
	});

	describe("Initialisation", () => {
		let controller, config;

		beforeEach(() => {
			config = {
				api_key: test_api_key,
				inputField: "#input",
				checkKey: false,
				removeOrganisation: false,
				outputFields: {
					line_1: "#line_1",
					line_2: "#line_2",
					line_3: "#line_3",
					post_town: "#post_town",
					postcode: "#postcode,#postcode2"
				}
			};
			controller = new IdealPostcodes.Autocomplete.Controller(config);
		});

		it ("sets instance properties", () => {
			expect(controller.checkKey).toEqual(false);
			expect(controller.inputField).toEqual("#input");
			expect(controller.removeOrganisation).toEqual(false);
			expect(controller.options.api_key).toEqual(test_api_key);
		});

		it ("creates an Ideal Postcodes client", () => {
			expect(controller.client).toBeDefined();
		});

		it ("registers callbacks", () => {
			const callbacks = ["onLoaded", "onFailedCheck", "onSuggestionsRetrieved", 
				"onAddressSelected", "onAddressRetrieved", "onSearchError", 
				"onOpen", "onBlur", "onClose", "onFocus", "onInput"];

			const completedCallbacks = [];

			callbacks.forEach(callback => {
				config[callback] = () => {
					completedCallbacks.push(callback);
				};
			});

			controller = new IdealPostcodes.Autocomplete.Controller(config);

			callbacks.forEach(callback => {
				controller[callback]()
				expect(completedCallbacks).toContain(callback);
			});
		});

		it ("stores output fields as arrays and splits them by comma", () => {
			expect(controller.outputFields.line_1).toEqual(["#line_1"]);
			expect(controller.outputFields.line_2).toEqual(["#line_2"]);
			expect(controller.outputFields.line_3).toEqual(["#line_3"]);
			expect(controller.outputFields.postcode).toEqual(["#postcode", "#postcode2"]);
			expect(controller.outputFields.post_town).toEqual(["#post_town"]);
		});
	});

	describe("Callbacks", () => {
		let controller;

		describe("onLoaded", () => {
			it ("is invoked when controller is instantiated", done => {
				controller = new IdealPostcodes.Autocomplete.Controller({
					api_key: test_api_key,
					inputField: "#input",
					checkKey: false,
					onLoaded: done
				});
			});
		});

		describe("onFailedCheck", () => {
			beforeEach(() => {
				installAjax();
				loadFixtures("basic.html");
			});

			afterEach(uninstallAjax);

			it ("is invoked when check fails", done => {
				controller = new IdealPostcodes.Autocomplete.Controller({
					checkKey: true,
					api_key: test_api_key,
					inputField: "#input",
					onFailedCheck: done,
					onLoaded: () => {
						done(new Error("Should not be called"));
					}
				});
				expectResponse(responses.keys.notUsable);
			});
			it ("is not invoked when check passes", done => {
				controller = new IdealPostcodes.Autocomplete.Controller({
					checkKey: true,
					api_key: test_api_key,
					inputField: "#input",
					onLoaded: done,
					onFailedCheck: () => {
						done(new Error("Should not be called"));
					}
				});
				expectResponse(responses.keys.notUsable);
			});
		});

		describe("onSuggestionsRetrieved", () => {
			beforeEach(() => {
				installAjax();
				loadFixtures("basic.html");
			});

			afterEach(uninstallAjax);

			it ("is invoked when suggestions retrieved", done => {
				controller = new IdealPostcodes.Autocomplete.Controller({
					api_key: test_api_key,
					inputField: "#input",
					onSuggestionsRetrieved: done
				});
				controller.client.autocompleteAddress({ query: "foo" });
				setTimeout(() => {
					expectResponse(responses.autocomplete.results);
				}, 250);
			});
		});

		describe("onAddressSelected", () => {
			it ("is invoked when an address is selected", done => {
				controller = new IdealPostcodes.Autocomplete.Controller({
					api_key: test_api_key,
					inputField: "#input",
					onAddressSelected: done
				});
				const cInterface = controller.interface;
				const suggestions = JSON.parse(responses.autocomplete.results.responseText).result.hits;
				cInterface.setSuggestions(suggestions);
				cInterface.select(cInterface.suggestionList.children[0]);
			});
		});

		describe("onAddressRetrieved", () => {
			beforeEach(() => {
				installAjax();
				loadFixtures("basic.html");
			});

			afterEach(uninstallAjax);

			it ("is invoked when address has been retrieved from API", done => {
				controller = new IdealPostcodes.Autocomplete.Controller({
					api_key: test_api_key,
					inputField: "#input",
					onAddressRetrieved: done
				});
				const cInterface = controller.interface;
				const suggestions = JSON.parse(responses.autocomplete.results.responseText).result.hits;
				cInterface.setSuggestions(suggestions);
				cInterface.select(cInterface.suggestionList.children[0]);
				expectResponse(responses.udprn.results);
			});
		});

		describe("onSearchError", () => {
			beforeEach(() => {
				installAjax();
				loadFixtures("basic.html");
			});

			afterEach(uninstallAjax);

			it ("is invoked on suggestion error", done => {
				controller = new IdealPostcodes.Autocomplete.Controller({
					api_key: test_api_key,
					inputField: "#input",
					onSearchError: done
				});
				controller.client.autocompleteAddress({ query: "foo" });
				setTimeout(() => {
					expectResponse(responses.autocomplete.error);
				}, 250);
			});

			it ("is invoked on address retrieval error error", done => {
				controller = new IdealPostcodes.Autocomplete.Controller({
					api_key: test_api_key,
					inputField: "#input",
					onSearchError: done
				});
				controller.interface.onSelect({ udprn: 8 });
				expectResponse(responses.autocomplete.error);
			});
		});

		describe("onOpen", () => {
			it ("is invoked when interface is opened", done => {
				controller = new IdealPostcodes.Autocomplete.Controller({
					api_key: test_api_key,
					inputField: "#input",
					onOpen: done
				});
				controller.interface.open();
			});
		});

		describe("onBlur", () => {
			it ("is invoked when input is blured", done => {
				controller = new IdealPostcodes.Autocomplete.Controller({
					api_key: test_api_key,
					inputField: "#input",
					onBlur: done
				});
				controller.interface._onBlur();
			});
		});

		describe("onClose", () => {
			it ("is invoked when interface is closed", done => {
				controller = new IdealPostcodes.Autocomplete.Controller({
					api_key: test_api_key,
					inputField: "#input",
					onClose: done
				});
				controller.interface.open();
				controller.interface.close();
			});
		});

		describe("onFocus", () => {
			it ("is invoked when input is focused", done => {
				controller = new IdealPostcodes.Autocomplete.Controller({
					api_key: test_api_key,
					inputField: "#input",
					onFocus: done
				});
				controller.interface._onFocus();
			});
		});

		describe("onInput", () => {
			beforeEach(() => {
				installAjax();
				loadFixtures("basic.html");
			});

			afterEach(uninstallAjax);

			it ("is invoked when user inputs query", done => {
				controller = new IdealPostcodes.Autocomplete.Controller({
					api_key: test_api_key,
					inputField: "#input"
				});
				spyOn(controller, "onInput");
				controller.interface._onInput();
				setTimeout(() => {
					expectResponse(responses.autocomplete.results);
					expect(controller.onInput).toHaveBeenCalled();
					done();
				}, 250);
			});
		});
	});

	describe("Address Population", () => {
		let controller, config, address;

		beforeEach(() => {
			loadFixtures("duplicate.html");
			config = {
				api_key: test_api_key,
				inputField: "#input",
				outputFields: {
					line_1: "#line_1",
					line_2: "#line_2",
					line_3: "#line_3",
					post_town: "#post_town",
					postcode: "#postcode,#postcode2"
				}
			};
			controller = new IdealPostcodes.Autocomplete.Controller(config);
			address = JSON.parse(responses.udprn.results.responseText).result;
			controller.populateAddress(address);
		});

		it ("pipes addresses to fields", () => {
			expect($(config.outputFields.line_1).val()).toEqual("2 Barons Court Road");
			expect($(config.outputFields.line_2).val()).toEqual("");
			expect($(config.outputFields.line_3).val()).toEqual("");
			expect($(config.outputFields.post_town).val()).toEqual("LONDON");
			expect($(config.outputFields.postcode.split(",")[0]).val()).toEqual("ID1 1QD");
		});

		it ("allows multiple output fields per attribute", () => {
			expect($("#postcode2").val()).toEqual("ID1 1QD");
		});
	});

	describe("Initialise interface", () => {
		let controller, config;

		beforeEach(() => {
			loadFixtures("basic.html");
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

		it ("creates interface instance", () => {
			expect(controller.interface).toBeDefined();
		});

		describe("Key checking", () => {
			let controller, config;

			beforeEach(() => {
				installAjax();
				loadFixtures("basic.html");
			});

			afterEach(uninstallAjax);

			it ("performs key check if specified", done => {
				config = {
					checkKey: true,
					api_key: test_api_key,
					inputField: "#input",
					onFailedCheck: () => {
						done(new Error("Should not be called"));
					},
					onLoaded: done
				};
				controller = new IdealPostcodes.Autocomplete.Controller(config);
				expectResponse(responses.keys.usable);
			});

			it ("does not attach controller and calls fail check when key not ready", done => {
				config = {
					checkKey: true,
					api_key: test_api_key,
					inputField: "#input",
					onFailedCheck: () => {
						expect(controller.interface).toBeUndefined();
						done();
					},
					onLoaded: () => {
						done(new Error("Should not be called"));
					}
				};
				controller = new IdealPostcodes.Autocomplete.Controller(config);
				expectResponse(responses.keys.notUsable);
			});
		});
	});
});
