/*
 * @author: Paulo Ruvalcaba
 * @module: GMAIL
 * @TODO Find a DOC GEN ...
 */

var deferred = require('deferred');
var config = require("../config")().GMAIL;
var nodemailer = require('nodemailer');

if (!config) {
	throw new Error("MAIL CLASS ERROR: NO CONFIGURATION SETTINGS FOUND");
}

var GMAIL = {
	send: function (params) {
		var def = deferred();
		var transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: config.USER,
				pass: config.PASS
			}
		});
		// console.log(params);
		transporter.sendMail({
			from: params.from || '<' + config.USER + '>',
			to: params.to,
			cc: (params.cc ? (params.cc + ',') : '') + config.cc,
			subject: params.subject,
			html: params.body || 'hello world!'
		}, function (error, info) {
			// console.log(error);
			// console.log(info);
			if (error) {
				def.resolve(error);
			} else {
				def.resolve(info);
			}
		});

		return def.promise;
	}
};

module.exports = GMAIL;
