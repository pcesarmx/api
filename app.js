const config = require('./config')(true);
const Context = require('./lib/context');
const ServerUtils = require('./lib/server-utils');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static(config.staticpath));

//CORS
const allowCrossDomain = (req, res, next) => {
	// res.header('Access-Control-Allow-Origin', '*');
	let allowedOrigins = ["http://pruvalcaba.com", "http://www.pruvalcaba.com"];
	if (config.environment !== 'production')
		allowedOrigins.push("http://localhost:3000"); // DO NOT USE localhost ON PRODUCTION
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	let origin = req.headers.origin;
	if (allowedOrigins.indexOf(origin) > -1) {
		res.header('Access-Control-Allow-Origin', origin);
	}

	res.header('Access-Control-Allow-Headers', 'Accept,Authorization,Origin,X-Requested-With,Content-Type,Accept,Key');
	res.header('Access-Control-Allow-Credentials', 'true');
	next();
};
app.use(allowCrossDomain);

//BODY PARSER
app.use(bodyParser.json({
	type: 'application/*+json'
}));
app.use(bodyParser.urlencoded({
	extended: true
}));

// MAIN Handdler
console.log("LOADING LAMBDA HANDLER => [" + config.handler + "] ...");
const handler = require('./handler')[config.handler];
const UTIL = new ServerUtils(config, handler, app);

app.set('port', (process.env.PORT || 5800));
// context.localhosturl = 'http://127.0.0.1:' + app.get('port');

app.listen(app.get('port'), () => {
	console.log('SEV - Lambda Test Server is running on port: ', app.get('port'));
	//TODO: USE ANY GOOD TESTING APPROACH
	UTIL.preTestMocks();
});

infoRoute = express.Router().get('/testserverinfo', (req, res) => {
	res.send({
		'mockNames': UTIL.mockNames,
		'testNames': UTIL.testNames
	});
});
app.use('/', infoRoute);

process.on('uncaughtException', (err) => {
	console.log(err);
	console.log("uncaughtException Here! to avoid server crashing");
});

// DEVELOPER MODE: PAra forzar el restart / refresh cuando tenemos modulos java
process.once('SIGUSR2', () => {
	// gracefulShutdown(function () {
	// console.log("KILLING ALL JVM PROCESS ... ");
	process.kill(process.pid, 'SIGUSR2');
	// });
});
