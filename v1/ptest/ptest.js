const deferred = require('deferred');
const fb = require('../../classes/firebase');

module.exports = (event, context) => {
	if (!event || !event.action) {
		context.fail({
			"code": 1001,
			"data": "Invalid Parameters"
		});
		return;
	}
	event.action = event.action.toLowerCase();
	try {
		switch (event.action) {
		case "login":
			fb.generateToken("ptest", event.workspace || "test", {}).then(function (token) {
				context.succeed({
					"success": true,
					"r": token
				});
			}).catch(function (err) {
				context.fail({
					"err": err
				});
			});
			break;
		case "testapi":
			fb.read('workspaces').then(function (r) {
				context.succeed({
					"success": true,
					"r": r
				});
			}).catch(function (err) {
				context.fail({
					"success": false
				});
			});
			break;
		default:
			context.fail({
				"code": 1002,
				"data": "Action not implemented"
			});
		}
	} catch (exep) {
		console.log("1003 - ERROR ", exep);
		context.fail({
			"code": 1003,
			"data": "Internal Error"
		});
	}
};
