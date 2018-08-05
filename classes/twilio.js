/*
 * @author: Paulo Ruvalcaba
 * @module: TWILIO
 * @TODO Find a DOC GEN ...
 */

const deferred = require('deferred');
const config = require("../config")().TWILIO;
const twilio = require('twilio');
const unidecode = require('unidecode');

if (!config) {
	throw new Error("TWILIO CLASS ERROR: NO CONFIGURATION SETTINGS FOUND");
}

const TWILIO = {
	sendsms: (params) => {
		let def = deferred();
		if (params.mobile === '') {
			def.reject({
				"error": "TWILIO: Invalid Params"
			});
			return def.promise;
		}

		let client = new twilio.RestClient(config.ACC_SID, config.TOKEN);
		try {
			params.mobile = params.mobile;
			if (params.mobile.lenght <= 10)
				params.mobile = "+1" + params.mobile;
		} catch (e) {}
		client.messages.create({
			to: params.mobile,
			callerid: 'REMOTE APP',
			from: config.NUMBER,
			body: unidecode(params.msg) || 'Testing Twilio and node.js'
		}, (error, message) => {
			if (!error) {
				def.resolve({
					"msg": "Message has been send to: " + params.mobile,
					"data": {
						"sid": message.sid,
						"dateCreted": message.dateCreated
					}
				});
			} else {
				// console.log("----");
				// console.log(error);
				// console.log(message);
				// console.log("----");
				def.reject(error.message);
			}
		});
		return def.promise;
	}
};

module.exports = TWILIO;
