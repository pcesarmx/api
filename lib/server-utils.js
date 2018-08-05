// Helps express server to attach lambda handdler and end points
const globSync = require('glob').sync;
const deferred = require('deferred');
const json = require('comment-json');
const fs = require('fs');
const Context = require('./context');
const express = require('express');

// PRIVATE
let api_path_fixed;

function getLocalPath(paths, index) {
	let path = paths[index].replace(this._config.api_path, '');
	return path.substr(0, path.lastIndexOf('/')).replace(".", "");
}

class ServerUtils {
	get mockNames() {
		return this._mockNames;
	}

	get testNames() {
		return this._testNames;
	}

	constructor(config, handler, app) {
		this._config = config;
		// fixing API path according to /lib
		api_path_fixed = ((config.api_path.substr(0, 2) === "./") ? "." : "../") + (config.api_path || "");
		// console.log("===> ", this.api_path);
		this.handler = handler;
		this._app = app;

		this.mocks = globSync(api_path_fixed + '**/*.js', {
			cwd: __dirname
		}).map(require);

		this._mockNames = globSync(api_path_fixed + '**/*.js', {
			cwd: __dirname
		});
		this._testNames = globSync(api_path_fixed + '**/_test.json', {
			cwd: __dirname
		});

		if (handler) {
			app.use('/' + config.handler, this.buildRoute(express.Router(), handler));
			console.log("\t\"" + config.handler + "\" ... READY");
		} else {
			console.log("\t***** NO HANDLER FOUND: \n\tThe handler [" + config.handler + "] not matches the handler in your \"index.js\"\n\tFix this matching the handler in the \"config.js\"");
		}

		// MOCKS MODE
		if (config.use_mocks) {
			console.log("LOADING ENDPOINTS ...");
			var UTIL = this;
			// console.log("this.mocks ==> ", this.mocks);
			this.mocks.forEach(function (route, index) {
				let mockRoute = getLocalPath.bind(UTIL)(UTIL.mockNames, index);
				app.use('/' + mockRoute, UTIL.buildRoute(express.Router(), route));
				console.log("\t\"" + mockRoute + "\" ... READY");
				// Check a way to run test
				// route({}, context);
			});
		}
	}

	performTest(t) {
		let def = deferred();
		let deferredTask = [];
		let deferredContexts = [];
		// let test = require(t);
		// console.log("t", t);
		let test = json.parse(fs.readFileSync(t).toString(), null, true); // Removing comments on JSON file
		// console.log(test);
		let msg = "";
		let x = 0;
		// console.log("zz => ", zz);
		try {
			let _config = this._config;
			if (test.enabled !== false) {
				let delay = test.delay_ms || 0;
				let _tmp = t.split("/");
				let operation = _tmp[_tmp.length - 2];
				operation += ("/" + operation);

				test.tests.forEach((testItem, i) => {
					testItem.event = testItem.event || {};
					// console.log(testItem);
					if (testItem.enabled !== false) {
						let c = new Context({}, this._config);
						testItem.event._operation = operation;
						c.isDeferred = true;
						c.deferred = deferred();
						c.testingParams = testItem.event;

						if (delay > 0) {
							setTimeout(() => {
								if (_config.log_debug) console.log('\nDelayed : ' + (delay * i) + 'ms ...');
								this.handler(testItem.event, c);
							}, delay * i);
							x = delay * i;
						} else {
							this.handler(testItem.event, c);
						}
						deferredContexts.push(c);
						deferredTask.push(c.deferred.promise);
					} else {
						let dummy = deferred();
						dummy.resolve({
							"testingParams": "TEST DISABLED",
							"testResult": "test[" + i + "] has been disabled"
						});
						deferredTask.push(dummy.promise);
					}
				});

				//Test on parallel mode: (Use when all test are expected SUCCESS)
				deferred.reduce(deferredTask, (obj, err) => {
					return obj || err;
				})((result) => {
					// console.log(result);
					if (_config.log_debug) {
						msg = "ALL test done :)";
						console.log(msg);
					}
				}, (error) => {
					// console.log(error);
					console.log('\x1b[31m', '\n *** Some test have not been passed :( ***\n', '\x1b[0m');
					msg = "Some test have not been passed :(";
				}).finally(() => {
					let details = [];
					// console.log(deferredTask);
					deferredTask.forEach((item) => {
						details.push(item.value);
					});
					// console.log(details);
					if (_config.log_debug) console.log("All Promises DONE");
					def.resolve({
						'msg': msg,
						'details': details
					});
				});
				//TODO: Test on secuential mode; Test when test have some dependencies


			} else {
				if (_config.log_debug) console.log(t + "\t\t ... DISABLED");
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
	}

	getRequestGET(route) {
		let _config = this._config;
		return (req, res) => {
			// let ctx = _.extend({}, context);
			let ctx = new Context(res, _config);
			// console.log("=>>>", ctx);
			// ctx.res = res;
			route(req.query, ctx);
		};
	}

	getRequestPOST(route) {
		let _config = this._config;
		return (req, res) => {
			// res.redirect('/tester');
			let ctx = new Context(res, _config);
			// let ctx = _.extend({}, context);
			// ctx.res = res;
			// console.log(req.body);
			route(req.body, ctx);
		};
	}

	getRequestTest(route) {
		let _config = this._config;
		// console.log("_config", _config);
		return (req, res) => {
			// context.res = res;
			let id = req.originalUrl.replace('.test', '');
			let testFiles = globSync(api_path_fixed + id + '**/_test.json', {
				cwd: __dirname
			});
			// console.log("testFiles => ", testFiles);
			let arrProm = [];

			if (testFiles.length === 0) {
				res.status(200).send({
					"msg": "TEST File Not Found, Please create  .." + api_path_fixed + id.replace('/', '') + "/_test.json"
				});
				return;
			}
			// console.log(testFiles);

			testFiles.forEach((item, i) => {
				arrProm.push(this.performTest(item.substr(1)));
			});

			deferred.reduce(arrProm, (obj, err) => {
				return obj || err;
			}).finally(() => {
				let details = [];
				arrProm.forEach((item) => {
					details.push(item.value);
				});
				// console.log(details);
				res.status(200).send(details);
			});
		};
	}

	// SET METHODS GET, POST
	buildRoute(router, r) {
		router.get('/', this.getRequestGET(r));
		router.post('/', this.getRequestPOST(r));
		// router.post('/', upload.array(), this.getRequestPOST(r));
		router.get('/(.test)?', this.getRequestTest(r));
		return router;
	}

	preTestMocks() {
		if (this._config.use_pre_test) {
			console.log("\n\nPRE-TESTING MODULES ...");
			let UTIL = this;
			this.mocks.forEach((route, index) => {
				let mockRoute = getLocalPath.bind(UTIL)(this.mockNames, index);
				let test = "Pre-Testing " + mockRoute + "...\t\t";
				let testResult;
				try {
					// FIND A WAY TO CALL MOCKS
					// route({}, new Context({}, config)); //route({}, context);
					testResult = "PASS";
				} catch (err) {
					testResult = "NOT PASSED\n" + err.stack;
				}
				console.log("" + test + '\t ... ' + testResult + "");
			});
		}
	}
}

module.exports = ServerUtils;
