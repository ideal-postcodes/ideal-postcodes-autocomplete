if (!window.responses) window.responses = {};

(function (responses) {
	responses["keys"] = {
		usable: {
			status: 200,
			contentType: "application/json",
			responseText: '{"result":{"available":true},"code":2000,"message":"Success"}'
		},
		notUsable: {
			status: 200,
			contentType: "application/json",
			responseText: '{"result":{"available":false},"code":2000,"message":"Success"}'
		}
	};
}(window.responses));
