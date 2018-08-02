/*jshint esnext: true */

var config = require('./config')(true);
var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var _ = require("underscore");
var globSync = require('glob').sync;
var mocks = globSync(config.api_path + '**/*.js', {
	cwd: __dirname
}).map(require);
var gateways = globSync(config.api_path + '**/swagger.json', {
	cwd: __dirname
}).map(require);

var deferred = require('deferred');
app.use(express.static(config.staticpath));

//CORS
var allowCrossDomain = function (req, res, next) {
	// res.header('Access-Control-Allow-Origin', '*');
	var allowedOrigins = ["http://localhost:3000", "http://pruvalcaba.com", "http://www.pruvalcaba.com"];
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	var origin = req.headers.origin;
	if (allowedOrigins.indexOf(origin) > -1) {
		res.header('Access-Control-Allow-Origin', origin);
	}

	res.header('Access-Control-Allow-Headers', 'Accept,Authorization,Origin,X-Requested-With,Content-Type,Accept,Key');
	res.header('Access-Control-Allow-Credentials', 'true');
	next();
};
app.use(allowCrossDomain);


var context = {
	awsRequestId: 'LAMBDA_INVOKE',
	logStreamName: 'LAMBDA_INVOKE',
	clientContext: null,
	identity: null,
	config: config,
	res: null,
	isDeferred: false,
	testingParams: {},
	deferred: false,
	localhosturl: "",
	done: function (error, result) {
		if (error === null) {
			this.succeed(result);
		} else {
			this.fail(error);
		}
		//console.log(this.deferred);
	},
	succeed: function (result) {
		if (config.log_context) {
			console.log("");
			console.log("Success!  Message:");
			console.log("------------------");
			console.log(result);
		}

		if (this.isDeferred) {
			if (config.log_debug) console.log("Resolving deferred method");
			// result.inputTested = this.testingParams;
			// console.log(this.testingParams);
			this.deferred.resolve({
				'testingParams': this.testingParams,
				'testResult': result
			});
			// delete this;
		} else if (this.res && !this.res.headersSent) {
			this.res.status(200).send(result);
			this.res = null;
		}
		// done(true);
	},
	fail: function (error) {
		if (config.log_context) {
			console.log('\x1b[31m');
			console.log("Failure!  Message:");
			console.log("------------------");
			console.log(error);
			console.log('\x1b[0m');
		}

		if (this.res && !this.res.headersSent) {
			this.res.status(400).send(error);
			this.res = null;
		}
		// done(false);
	}
};
const mockNames = globSync(config.api_path + '**/*.js', {
	cwd: __dirname
});

const testNames = globSync(config.api_path + '**/_test.json', {
	cwd: __dirname
});

const gatewayNames = globSync(config.api_path + '**/swagger.json', {
	cwd: __dirname
});
// GLOBAL.context = context;

//BODY PARSER
app.use(bodyParser.json({
	type: 'application/*+json'
}));
app.use(bodyParser.urlencoded({
	extended: true
}));

// Improve later
var UTIL = {
	performTest: function (t) {
		var def = deferred();
		var deferredTask = [];
		var deferredContexts = [];
		var test = require(t);
		var msg = "";
		var x = 0;
		try {
			if (test.enabled !== false) {
				var delay = test.delay_ms || 0;
				test.tests.forEach(function (testItem, i) {
					// console.log(testItem);
					if (testItem.enabled !== false) {
						var c = Object.create(context);
						c.isDeferred = true;
						c.testingParams = JSON.stringify(testItem.event);
						c.deferred = deferred();

						if (delay > 0) {
							setTimeout(function () {
								if (config.log_debug) console.log('\nDelayed : ' + (delay * i) + 'ms ...');
								handler(testItem.event, c);
							}, delay * i);
							x = delay * i;
						} else {
							handler(testItem.event, c);
						}
						deferredContexts.push(c);
						deferredTask.push(c.deferred.promise);
					}
				});

				//Test on parallel mode: (Use when all test are expected SUCCESS)
				deferred.reduce(deferredTask, function (obj, err) {
					return obj || err;
				})(function (result) {
					// console.log(result);
					if (config.log_debug) {
						msg = "ALL test have been passed :)";
						console.log(msg);
					}
				}, function (error) {
					// console.log(error);
					console.log('\x1b[31m', '\n *** Some test have not been passed :( ***\n', '\x1b[0m');
					msg = "Some test have not been passed :(";
				}).finally(function () {
					var details = [];
					// console.log(deferredTask);
					deferredTask.forEach(function (item) {
						details.push(item.value);
					});
					// console.log(details);
					if (config.log_debug) console.log("All Promises DONE");
					def.resolve({
						'msg': msg,
						'details': details
					});
				});
				//TODO: Test on secuential mode; Test when test have some dependencies


			} else {
				if (config.log_debug) console.log(t + "\t\t ... DISABLED");
				def.resolve({
					'msg': t + " ... DISABLED",
					'details': []
				});
			}
		} catch (ex) {
			console.log("Some error occurred " + ex.stack);
			def.reject(ex.stack);
		}
		return def.promise;
	},
	getLocalPath: function (paths, index) {
		var path = paths[index].replace(config.api_path, '');
		return path.substr(0, path.lastIndexOf('/'));
	},
	getRequestGET: function (route) {
		return function (req, res) {
			var ctx = _.extend({}, context);
			ctx.res = res;
			route(req.query, ctx);
		};
	},
	getRequestPOST: function (route) {
		return function (req, res) {
			// res.redirect('/tester');

			var ctx = _.extend({}, context);
			ctx.res = res;
			// console.log(req.body);
			route(req.body, ctx);
		};
	},
	getRequestTest: function (route) {
		return function (req, res) {
			context.res = res;
			var id = req.originalUrl.replace('.test', '');
			var testFiles = globSync(config.api_path + id + '**/_test.json', {
				cwd: __dirname
			});
			var arrProm = [];

			if (testFiles.length === 0) {
				res.status(200).send({
					"msg": "TEST File Not Found, Please create  .." + config.api_path + id.replace('/', '') + "/_test.json"
				});
				return;
			}
			console.log(testFiles);

			testFiles.forEach(function (item, i) {
				arrProm.push(UTIL.performTest(item));
			});

			deferred.reduce(arrProm, function (obj, err) {
				return obj || err;
			}).finally(function () {
				var details = [];
				arrProm.forEach(function (item) {
					details.push(item.value);
				});
				// console.log(details);
				res.status(200).send(details);
			});
		};
	},
	// SET METHODS GET, POST
	buildRoute: function (router, r) {
		router.get('/', this.getRequestGET(r));
		router.post('/', this.getRequestPOST(r));
		// router.post('/', upload.array(), this.getRequestPOST(r));
		router.get('/(.test)?', this.getRequestTest(r));
		return router;
	}
};

// MAIN Handdler
console.log("LOADING LAMBDA HANDLER => [" + config.handler + "] ...");
var handler = require('./handler')[config.handler];
if (handler) {
	app.use('/' + config.handler, UTIL.buildRoute(express.Router(), handler));
	console.log("\t\"" + config.handler + "\" ... READY");
} else {
	console.log("\t***** NO HANDLER FOUND: \n\tThe handler [" + config.handler + "] not matches the handler in your \"index.js\"\n\tFix this matching the handler in the \"config.js\"");
}

// MOCKS MODE
if (config.use_mocks) {
	console.log("LOADING ENDPOINTS ...");
	mocks.forEach(function (route, index) {
		var mockRoute = UTIL.getLocalPath(mockNames, index);
		app.use('/' + mockRoute, UTIL.buildRoute(express.Router(), route));
		console.log("\t\"" + mockRoute + "\" ... READY");
		// Check a way to run test
		// route({}, context);
	});
}

app.set('port', (process.env.PORT || 5800));
context.localhosturl = 'http://127.0.0.1:' + app.get('port');

app.listen(app.get('port'), function () {
	console.log('SEV - Lambda Test Server is running on port: ', app.get('port'));
	//TODO: USE ANY GOOD TESTING APPROACH
	if (config.use_pre_test) {
		console.log("\n\nPRE-TESTING MODULES ...");
		mocks.forEach(function (route, index) {
			var mockRoute = UTIL.getLocalPath(mockNames, index);
			var test = "Pre-Testing " + mockRoute + "...\t\t";
			try {
				route({}, context);
				testResult = "PASS";
			} catch (err) {
				testResult = "NOT PASSED\n" + err.stack;
			}
			console.log("" + test + '\t ... ' + testResult + "");
		});
	}
});

infoRoute = express.Router().get('/testserverinfo', function (req, res) {
	res.send({
		'mockNames': mockNames,
		'testNames': testNames
	});
});
app.use('/', infoRoute);

gatewayRoute = express.Router().get('/gtw', function (req, res) {
	swaggerHeader = require('./swagger.json');
	gateways.forEach(function (g, i) {
		swaggerHeader.paths['/' + UTIL.getLocalPath(gatewayNames, i) + '/'] = g;
	});
	if (config.environment !== 'production') {
		swaggerHeader.schemes.pop();
		swaggerHeader.schemes.push('http');
		swaggerHeader.host = 'localhost:5400';
		// console.log(swaggerHeader.host);
	}
	res.send(swaggerHeader);
});
app.use('/', gatewayRoute);



process.on('uncaughtException', function (err) {
	console.log(err);
	console.log("uncaughtException Here! to avoid server crashing");
});

// DEVELOPER MODE: PAra forzar el restart / refresh cuando tenemos modulos java
process.once('SIGUSR2', function () {
	// gracefulShutdown(function () {
	// console.log("KILLING ALL JVM PROCESS ... ");
	process.kill(process.pid, 'SIGUSR2');
	// });
});
