"use strict";

var controller = new IdealPostcodes.Autocomplete.Controller({
	api_key: "iddqd",
	inputField: "#input",
	outputFields: {
		line_1: "#line_1",
		line_2: "#line_2",
		line_3: "#line_3",
		post_town: "#post_town",
		postcode: "#postcode"
	}
});
