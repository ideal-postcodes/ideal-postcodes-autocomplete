"use strict";

jasmine.getFixtures().fixturesPath = 'base/fixtures';

describe("Interface", () => {
	let controller, config, cInterface;

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
		cInterface = controller.interface;
	});

	describe("Initialisation", () => {
		it ("wraps input field", () => {
			const parent = document.getElementById("input").parentElement;
			expect(parent).toEqual(controller.interface.container);
		});
		it ("creates list and message box", () => {
			const parent = document.getElementById("input").parentElement;
			expect(parent.children[1].nodeName).toEqual("UL");
		});
		it ("hides suggestion list and message", () => {
			const parent = document.getElementById("input").parentElement;
			expect(isHidden(parent.children[1])).toEqual(true);
		});
	});

	describe("Suggestions", () => {
		it ("populates list box with suggestions", () => {
			const list = controller.interface.suggestionList;
			const apiResponse = JSON.parse(responses.autocomplete.results.responseText).result.hits;
			expect(isHidden(list)).toEqual(true);
			controller.interface.setSuggestions(apiResponse);
			expect(isHidden(list)).toEqual(false);
			expect(list.children.length).toEqual(10);
		});
	});

	describe("#setSuggestions", () => {
		it ("sets internal suggestion list", () => {
			const newSuggestions = [{ suggestion: "Foo" }];
			cInterface.setSuggestions(newSuggestions);
			expect(cInterface.suggestions).toEqual(newSuggestions);
		});
		it ("refreshses interface", () => {
			spyOn(cInterface, "refresh");
			cInterface.setSuggestions([]);
			expect(cInterface.refresh).toHaveBeenCalled();
		});
	});

	describe("#initialiseCallbacks", () => {
		it ("assigns callbacks", () => {
			const callbacks = IdealPostcodes.Autocomplete.interfaceCallbacks;
			const completedCallbacks = [];
			const config = {
				inputField: "#input"
			};

			callbacks.forEach(callback => {
				config[callback] = () => {
					completedCallbacks.push(callback);
				}
			});

			const i = new IdealPostcodes.Autocomplete.Interface(config);

			callbacks.forEach(callback => {
				i[callback]();
				expect(completedCallbacks).toContain(callback);
			});
		});
	});

	describe("#initialiseEventListeners", () => {
		let config;

		beforeEach(() => {
			config = { inputField: "#input" };
		});

		if (MODERN_BROWSER) {
			// Doesn't run unless modern browser
			it ("binds on focus event", done => {
				config.onFocus = done;
				cInterface = new IdealPostcodes.Autocomplete.Interface(config);
				cInterface.input.focus();
			});

			// Doesn't run unless modern browser
			it ("binds on blur event", done => {
				config.onBlur = done;
				cInterface = new IdealPostcodes.Autocomplete.Interface(config);
				cInterface.input.focus();
				cInterface.input.blur();
			});
		}
	});

	describe("#refresh", () => {
		let suggestions;

		beforeEach(() => {
			suggestions = ["Foo", "Bar", "Baz"].map(i => { 
				return { suggestion: i }
			});
		});

		it ("creates list elements for each suggestion", () => {
			cInterface.setSuggestions(suggestions);
			const ul = cInterface.suggestionList;
			for (let i = 0; i < ul.children.length; i++) {
				let elem = ul.children[i];
				expect(elem.innerHTML).toEqual(suggestions[i].suggestion);
				expect(elem.getAttribute("aria-selected")).toEqual("false");
			}
		});
		it ("resets highlight index", () => {
			cInterface.setSuggestions(suggestions);
			expect(cInterface.highlightIndex).toEqual(-1);
		});
		it ("opens if list is populated", () => {
			spyOn(cInterface, "open");
			cInterface.setSuggestions(suggestions);
			expect(cInterface.open).toHaveBeenCalled();
		});
		it ("closes if list is empty", () => {
			spyOn(cInterface, "close");
			cInterface.setSuggestions([]);
			expect(cInterface.close).toHaveBeenCalled();
		});
	});

	describe("Opening and closing list", () => {
		it ("#open, #close does what it says on the tin", () => {
			cInterface.open();
			expect(cInterface.opened()).toEqual(true);
			cInterface.open();
			expect(cInterface.opened()).toEqual(true);
			cInterface.close();
			expect(cInterface.opened()).toEqual(false);
			cInterface.close();
			expect(cInterface.opened()).toEqual(false);
		});
	});

	describe("#opened", () => {
		it ("returns true if opened", () => {
			cInterface.open();
			expect(cInterface.opened()).toEqual(true);
		});
		it ("returns false if closed", () => {
			expect(cInterface.opened()).toEqual(false);
		});
	})

	describe("Navigation", () => {
		let suggestions;

		describe("#next", () => {
			beforeEach(() => {
				suggestions = JSON.parse(responses.autocomplete.results.responseText).result.hits;
				cInterface.setSuggestions(suggestions);
			});

			it ("cycles to next suggestion", () => {
				suggestions.forEach((s, i) => {
					cInterface.next();
					expect(cInterface.highlightIndex).toEqual(i);
				});
			});

			it ("cycles to first item on next with last item", () => {
				cInterface.goto(suggestions.length - 1);
				cInterface.next();
				expect(cInterface.highlightIndex).toEqual(0);
			});
		});

		describe("#previous", () => {
			beforeEach(() => {
				suggestions = JSON.parse(responses.autocomplete.results.responseText).result.hits;
				cInterface.setSuggestions(suggestions);
			});

			it ("cycles to previous suggestion", () => {
				suggestions.forEach((s, i) => {
					cInterface.previous();
					expect(cInterface.highlightIndex).toEqual(suggestions.length - 1 - i);
				});
			});
			it ("cycles to last suggestion previous with first item", () => {
				cInterface.goto(0);
				cInterface.previous();
				expect(cInterface.highlightIndex).toEqual(suggestions.length - 1);
			});
		});

		if (MODERN_BROWSER) {
			describe("Events", () => {
				let suggestions;

				beforeEach(() => {
					installAjax();
					suggestions = JSON.parse(responses.autocomplete.results.responseText).result.hits;
					cInterface.setSuggestions(suggestions);
				});

				afterEach(uninstallAjax);

				it ("opens suggestion box when input clicked", () => {
					cInterface.close();
					expect(cInterface.opened()).toEqual(false);
					cInterface.input.focus();
					expect(cInterface.opened()).toEqual(true);
				});
				it ("hides suggestion box when not focused", () => {
					cInterface.close();
					expect(cInterface.opened()).toEqual(false);
					cInterface.input.focus();
					expect(cInterface.opened()).toEqual(true);
					cInterface.input.blur();
					expect(cInterface.opened()).toEqual(false);
				});
			});
		}
	});

	describe("#select", () => {
		let suggestions;

		beforeEach(() => {
			installAjax();
			suggestions = JSON.parse(responses.autocomplete.results.responseText).result.hits;
			cInterface.setSuggestions(suggestions);
		});

		afterEach(uninstallAjax);

		it ("pipes address to field on selection", () => {
			cInterface.select(cInterface.suggestionList.children[0]);
			expectResponse(responses.udprn.results);
			expect($(config.outputFields.line_1).val()).toEqual("2 Barons Court Road");
			expect($(config.outputFields.line_2).val()).toEqual("");
			expect($(config.outputFields.line_3).val()).toEqual("");
			expect($(config.outputFields.post_town).val()).toEqual("LONDON");
			expect($(config.outputFields.postcode.split(",")[0]).val()).toEqual("ID1 1QD");
		});

		it ("allows selection with mouse click", () => {
			cInterface.select($(cInterface.suggestionList.children[0]).click());
			expectResponse(responses.udprn.results);
			expect($(config.outputFields.line_1).val()).toEqual("2 Barons Court Road");
			expect($(config.outputFields.line_2).val()).toEqual("");
			expect($(config.outputFields.line_3).val()).toEqual("");
			expect($(config.outputFields.post_town).val()).toEqual("LONDON");
			expect($(config.outputFields.postcode.split(",")[0]).val()).toEqual("ID1 1QD");
		});
	});

	describe("#setMessage", () => {
		it ("sets message in container", () => {
			const message = "foo";
			cInterface.setMessage(message);
			expect(cInterface.suggestionList.children[0].innerHTML).toEqual(message);
		});
	});
});
