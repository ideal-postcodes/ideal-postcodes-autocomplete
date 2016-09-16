if (!window.responses) window.responses = {};

(function (responses) {
	var results = '{"result":{"postcode":"ID1 1QD","postcode_inward":"1QD","postcode_outward":"ID1","post_town":"LONDON","dependant_locality":"","double_dependant_locality":"","thoroughfare":"Barons Court Road","dependant_thoroughfare":"","building_number":"2","building_name":"","sub_building_name":"","po_box":"","department_name":"","organisation_name":"","udprn":0,"umprn":"","postcode_type":"S","su_organisation_indicator":"","delivery_point_suffix":"1G","line_1":"2 Barons Court Road","line_2":"","line_3":"","premise":"2","country":"England","county":"Greater London","administrative_county":"","postal_county":"","traditional_county":"Greater London","district":"Hammersmith and Fulham","ward":"North End","longitude":-0.208644362766368,"latitude":51.4899488390558,"eastings":524466,"northings":178299},"code":2000,"message":"Success"}';
	var noResults = '{"code":4044,"message":"No UDPRN found"}';
	var filteredResults = '{"result":{"line_1":"2 Barons Court Road","postcode":"ID1 1QD"},"code":2000,"message":"Success"}';
	var error = '{"code":5000,"message":"Uncatalogued error"}';

	responses.udprn = {
		results: {
			status: 200,
			contentType: "application/json",
			responseText: results
		},
		noResults: {
			status: 404,
			contentType: "application/json",
			responseText: noResults
		},
		filteredResults: {
			status: 200,
			contentType: "application/json",
			responseText: filteredResults
		},
		error: {
			status: 500,
			contentType: "application/json",
			responseText: error
		}
	}
}(window.responses));
