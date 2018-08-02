var SETTINGS = {};
try {
	SETTINGS = require('./private_config.json');
} catch (ex) {
	console.log(ex.message);
	console.log('\x1b[33m', 'CAN NOT LOAD PRIVATE SETTINGS (private_config.json)', '\x1b[0m')
}

module.exports = function (main) {
	var ENV = {
		api_path: './v1/',
		handler: 'handler',
		use_mocks: true,
		use_pre_test: false,
		log_context: false,
		log_debug: true,
		stage: "v1",
		environment: ((process.env.DEV_ENV) ? process.env.DEV_ENV : "devel"), //AWS
		staticpath: 'public/adminsite/'
	};
	// DEVELOPMENT SETTINGS
	ENV.TWILIO = SETTINGS.TWILIO || {};
	ENV.GMAIL = SETTINGS.GMAIL || {};

	if (ENV.environment === 'test' || ENV.environment === 'devel') {

		if (main) {
			console.log('\033[31m********************************************************************')
			console.log('********************* YOU ARE USING ' + ENV.environment.toUpperCase() + ' ENV *********************')
			console.log('********************************************************************', '\x1b[0m')
			ENV.staticpath = 'public/__test__/';
		}
	}

	if (ENV.environment === 'production') {
		// Overwrite settings
		ENV.TWILIO.NUMBER = process.env.TWILIO_NUMBER || ENV.TWILIO.NUMBER;
		ENV.TWILIO.ACC_SID = process.env.TWILIO_ACC_SID || ENV.TWILIO.ACC_SID;
		ENV.TWILIO.TOKEN = process.env.TWILIO_TOKEN || ENV.TWILIO.TOKEN;

		ENV.GMAIL.USER = process.env.GMAIL_USER || ENV.GMAIL.USER;
		ENV.GMAIL.PASS = process.env.GMAIL_PASS || ENV.GMAIL.PASS;
		ENV.GMAIL.CC = process.env.GMAIL_CC || ENV.GMAIL.CC;
	}

	return ENV;
};
