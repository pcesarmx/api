/*jshint esnext: true */
const config = require('./config')("");
const deferred = require('deferred');
// THIS IS A Server-less Module

exports[config.handler] = function (event, context) {
	// console.log("LAMBDA ENV => ", config.environment, " API ENV => ", event.ENV);
	try {
		// if (config.environment !== event.ENV && JSON.parse(event.PROTECT_ENV || true) === true) {
		// 	context.done(null, {
		// 		"success": false,
		// 		"error": "UNCONSISTENT_ENV_MATCH"
		// 	});
		// 	return;
		// }

		if (!event._operation) {
			context.done(null, {
				"success": false,
				"error": "_operation not defined"
			});
			return;
		}

		context.config = config;
		event._operation = event._operation || "ping/ping";

		var p = [];

		deferred.map(p)(function (resp) {
			try {
				// console.log("Licence Handler init => ", resp[0]);
				// console.log("Lang & Settings init => ", resp[1]);
				// console.log("LAMBDA ENABLED => ", resp[2]);

				// console.log("EXECUTING => ", config.api_path + event._operation);
				require(config.api_path + event._operation + '')(event, context);
			} catch (err) {
				console.log("Error on execution:", err);
			}
		}, function (error) {
			console.log("FAIL ON INIT =>", error);
			context.done(null, {
				"success": false,
				"code": 1092,
				"error": error
			});
		});
	} catch (ex) {
		// ex.module = event._operation;
		console.log("Handler catch ex => ", ex);
		var err = JSON.stringify(ex);
		context.fail((err === "{}") ? ex : err);
		// context.succeed(ex);
	}
};
