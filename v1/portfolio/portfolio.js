const deferred = require('deferred');
const U = require('../../classes/util');
const SMS = require('../../classes/twilio');
const EMAIL = require('../../classes/gmail');

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
		case "testapi":
			if (U.validateEmail(event.email) === false || event.name.trim() === "" || (event.phone + "").trim() === "" || event.message.trim() === "") {
				context.fail({
					"code": 1004,
					"data": "Invalid Parameters Values"
				});
				return;
			}
			deferred.map([EMAIL.send({
				"to": "pcesarmx@hotmail.com",
				"subject": "My Portfolio message from " + event.name,
				"body": "Email: " + event.email + "<br /> Phone " + event.phone + " <pre>" + event.message + "</pre><br />"
			}), SMS.sendsms({
				"mobile": "5593050938",
				"msg": "Name: " + event.name + "\nPhone: " + event.phone + "\ne-mail:" + event.email + "\n\n" + event.message
			})]).then((resp) => {
				context.succeed({
					"success": true
				});
			}).catch((err) => {
				console.log("err => ", err);
				context.fail({
					"data": err
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
		// console.log("1003 - ERROR ", exep);
		context.fail({
			"code": 1003,
			"data": "Internal Error"
		});
	}
};
