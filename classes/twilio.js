/*
 * @author: Paulo Ruvalcaba
 * @module: TWILIO
 * @TODO Find a DOC GEN ...
 */

var deferred = require('deferred');
var config = require("../config")().TWILIO;
var twilio = require('twilio');
var unidecode = require('unidecode');

if (!config) {
	throw new Error("TWILIO CLASS ERROR: NO CONFIGURATION SETTINGS FOUND");
}

var TWILIO = {
	sendsms: function (params) {
		var def = deferred();
		if (params.mobile === '') {
			def.reject({
				"error": "TWILIO: Invalid Params"
			});
			return def.promise;
		}

		var client = new twilio.RestClient(config.ACC_SID, config.TOKEN);
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
		}, function (error, message) {
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
