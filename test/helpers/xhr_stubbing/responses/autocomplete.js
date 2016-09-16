if (!window.responses) window.responses = {};

(function (responses) {
	var results = '{"result":{"hits":[{"suggestion":"10 Downing Avenue, Guildford, GU2","urls":{"udprn":"/v1/udprn/10093397"},"udprn":10093397},{"suggestion":"10 Downing Close, Ipswich, IP2","urls":{"udprn":"/v1/udprn/11520985"},"udprn":11520985},{"suggestion":"10 Downing Close, Harrow, HA2","urls":{"udprn":"/v1/udprn/10445693"},"udprn":10445693},{"suggestion":"10 Downing Drive, Leicester, LE5","urls":{"udprn":"/v1/udprn/13209396"},"udprn":13209396},{"suggestion":"10 Downing Grove, Hull, HU9","urls":{"udprn":"/v1/udprn/11168744"},"udprn":11168744},{"suggestion":"10 Downing Path, Slough, SL2","urls":{"udprn":"/v1/udprn/22341024"},"udprn":22341024},{"suggestion":"10 Downing Street, Preston, PR1","urls":{"udprn":"/v1/udprn/19531519"},"udprn":19531519},{"suggestion":"10 Downings, London, E6","urls":{"udprn":"/v1/udprn/7944730"},"udprn":7944730},{"suggestion":"10 Downing Avenue, Newcastle, ST5","urls":{"udprn":"/v1/udprn/23547463"},"udprn":23547463},{"suggestion":"10 Downing Street, Llanelli, SA15","urls":{"udprn":"/v1/udprn/21302857"},"udprn":21302857}]},"code":2000,"message":"Success"}';
	var noResults = '{"result":{"hits":[]},"code":2000,"message":"Success"}';
	var invalidKey = '{"code":4010,"message":"Invalid Key. For more information see http://ideal-postcodes.co.uk/documentation/response-codes#4010"}';
	var error = '{"code":5000,"message":"Uncatalogued error"}';

	responses.autocomplete = {
		results: {
			status: 200,
			contentType: "application/json",
			responseText: results
		},
		noResults: {
			status: 200,
			contentType: "application/json",
			responseText: noResults
		},
		error: {
			status: 500,
			contentType: "application/json",
			responseText: error
		}
	}
}(window.responses));
