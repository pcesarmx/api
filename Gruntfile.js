const path = require('path');
const request = require('request');
const config = require('./config')().APIGATEWAY;

module.exports = (grunt) => {
	grunt.initConfig({
		jshint: {
			all: {
				src: [
					'lib/**/*.js', 'classes/**/*.js', 'v1/**/*.js', 'v1/**/_test.json', 'app.js'
				],
			},
			options: {
				force: false,
				esversion: 6
			}
		},
		watch: {
			options: {
				livereload: 12345
			},
			grunt: {
				files: 'Gruntfile.js'
			},
			js: {
				files: [
					'lib/**/*.js', 'classes/**/*.js', 'v1/**/*.js', 'app.js'
				],
				tasks: ['jshint'],
			},
			html: {
				files: [
					'public/index.html'
				]
			},
			public: {
				files: [
					// 'public/**',
					// 'public/admin/**',
				],
			},
			nodemonrestart: {
				files: ['.rebooted'],
			}
		},
		nodemon: {
			options: {
				// cwd: 'API/',
				callback: (nodemon) => {
					nodemon.on('config:update', () => {
						console.log('[nodemon] STARTING BACKEND SERVER'.yellow);
					});
					nodemon.on('restart', () => {
						console.log('[nodemon] SERVER RESTART'.red);
						setTimeout(() => {
							require('fs').writeFileSync('.rebooted', 'rebooted');
						}, 1000);
					});
				}
			},
			sev_backend: {
				script: 'app.js'
			}
		},
		parallel: {
			web: {
				options: {
					stream: true
				},
				tasks: [{
					grunt: true,
					args: ['watch']
				}, {
					grunt: true,
					args: ['nodemon']
				}]
			}
		}
	});

	// Load the plugins that provides the tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-parallel');
	grunt.loadNpmTasks('grunt-open');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-run');

	grunt.log.ok('Starting: ');
	grunt.task.clearQueue();
	grunt.registerTask('admin', [
		'copy'
	]);
	grunt.registerTask('build', [
		'jshint'
	]);
	grunt.registerTask('default', ['build', 'parallel:web']);

	grunt.registerTask('build-api', function () {
		const config = require('./config')().APIGATEWAY;
		const _ = require("underscore");
		let lambdaVersion = "";
		const PKG_NAME = "lambda_module.zip";
		const TMP_FOLDER_NAME = ".tmpdeploy";
		const environment = config.environment || 'devel';
		const lambda_name = config.lambda + (environment === 'devel' ? '-devel' : '') + lambdaVersion;
		const api_name = lambda_name;
		let permissionsCMD = "";
		let cmd_custom_dirs = "";
		if (config.deploy_cmds && (config.deploy_cmds.cmd_custom_copy_dirs || []).length > 0) {
			console.log("ADDING CUSTOM FOLDERS TO PACKAGE".magenta, config.deploy_cmds.cmd_custom_copy_dirs);
			for (let path of config.deploy_cmds.cmd_custom_copy_dirs) {
				cmd_custom_dirs += "cp -r " + path + " ${0}; ";
			}
		}
		let cmd_custom_files = "";
		if (config.deploy_cmds && (config.deploy_cmds.cmd_custom_copy_files || []).length > 0) {
			console.log("ADDING CUSTOM FILES TO PACKAGE".magenta, config.deploy_cmds.cmd_custom_copy_files);
			cmd_custom_files = "cp";
			for (let file of config.deploy_cmds.cmd_custom_copy_files) {
				cmd_custom_files += " " + file;
			}
			cmd_custom_files += " ${0};";
		}

		const cmd_build_pkg = "rm -rf ${0}; mkdir ${0}; ${CUSTOM_FOLDERS} ${CUSTOM_FILES} cp -r classes ${0}; cp -r lib ${0}; cp -r v1 ${0}; cp -r node_modules ${0}; cp config.js ${0}; cp private_config.json ${0}; cp handler.js ${0}; cd ${0}; zip -rq ../${1} ./; cd ..; rm -r ${0};";
		const cmd_clean = "rm -f /p/a/t/h ${1};"
			// const cmd_clean = "rm ${1};"


		let LAMBDA_BUILD_CMD = cmd_build_pkg;
		LAMBDA_BUILD_CMD = LAMBDA_BUILD_CMD.replace(/\$\{CUSTOM_FILES\}/g, cmd_custom_files);
		LAMBDA_BUILD_CMD = LAMBDA_BUILD_CMD.replace(/\$\{CUSTOM_FOLDERS\}/g, cmd_custom_dirs);
		LAMBDA_BUILD_CMD = LAMBDA_BUILD_CMD.replace(/\$\{0\}/g, TMP_FOLDER_NAME);
		LAMBDA_BUILD_CMD = LAMBDA_BUILD_CMD.replace(/\$\{1\}/g, PKG_NAME);
		let LAMBDA_BUILD_CMD_CLEAN = cmd_clean;
		LAMBDA_BUILD_CMD_CLEAN = LAMBDA_BUILD_CMD_CLEAN.replace(/\$\{0\}/g, TMP_FOLDER_NAME);
		LAMBDA_BUILD_CMD_CLEAN = LAMBDA_BUILD_CMD_CLEAN.replace(/\$\{1\}/g, PKG_NAME);

		// console.log("LAMBDA_BUILD_CMD => ", LAMBDA_BUILD_CMD);

		function buildResourceConfig(u, t, rd, rb) {
			let resourceConfig = grunt.file.readJSON(__dirname + '/aws/apigateway/template.json');
			resourceConfig.get['x-amazon-apigateway-integration'].uri = u;
			resourceConfig.get['x-amazon-apigateway-integration'].requestTemplates['application/json'] = t;
			if (rd)
				resourceConfig.get.responses = rd;
			if (rb)
				resourceConfig.get['x-amazon-apigateway-integration'].responses = rb;

			return resourceConfig;
		}

		function testOKKK(api_id) {
			let endpoints = grunt.file.readJSON(__dirname + '/apigateway.swagger.config.json');
			console.log(("GENERATING API " + environment.toUpperCase() + " SWAGGER FILE ... ").magenta);
			if (!(environment === 'devel' || environment === 'production')) {
				console.log('Environment [--env] only can be "devel" or "production", so, using [DEFAULT = devel]');
				environment = 'devel';
			}
			let swagger = {};
			swagger.swagger = config.swagger || "2.0";
			swagger.info = {};
			swagger.info.title = api_name;
			swagger.info.version = config.version;
			swagger.host = api_id + "." + endpoints.host;
			swagger.basePath = config.base_path;
			swagger.schemes = config.schemes || [];
			console.log(("\tHOST => " + swagger.host).yellow);
			swagger.paths = {};

			if (config.lambda_version && config.lambda_version.length > 0) {
				lambdaVersion = ":" + config.lambda_version;
				console.log("Link to Lambda has been forced to version =>", config.lambda_version);
			}

			let loacalSwaggerAPI = {
				"swagger": config.swagger || "2.0",
				"info": {
					"version": swagger.info.version + "",
					"title": swagger.info.title
				},
				"host": config.swagger_host,
				"basePath": "/",
				"schemes": config.schemes || [],
				"paths": {},
				"definitions": {
					"Empty": {
						"type": "object"
					}
				}
			};

			for (var key in endpoints.resources) {
				var resource = endpoints.resources[key];
				var t = resource.requestTemplate;
				var rDef = resource.responsesDefinitions;
				var rBody = resource.responses;

				// DOC GENERATOR
				console.log(("\t\t|| endpoint => " + endpoints.resources[key].path).yellow);
				// console.log("|| requestTemplate => ", t);
				if (endpoints.resources[key].path !== "/") {
					var _key2 = endpoints.resources[key].path.substr(1, endpoints.resources[key].path.length);
					var _keysParams = Object.keys(t);


					try {

						loacalSwaggerAPI.paths["/" + _key2 + ""] = {
							"get": {
								"deprecated": endpoints.resources[key]["deprecated"] || false,
								"summary": endpoints.resources[key]["summary"] || "",
								"description": endpoints.resources[key]["description"] || "",
								"parameters": [],
								"responses": {
									"200": {
										"description": "request processed successfully"
									}
								}
							}
						};
					} catch (err) {
						console.log("ERR => ", err);
					}


					for (var kp in _keysParams) {
						// console.log("p[" + key + "]", _keysParams[kp]);
						if ("fb|nocache|extrainfo|operation|isProd".indexOf(_keysParams[kp]) > -1)
							continue;

						if (_keysParams[kp] === "action") {
							loacalSwaggerAPI.paths["/" + _key2 + ""].get.parameters.push({
								"name": _keysParams[kp],
								"in": "query",
								"required": true,
								"type": "string",
								"default": _key2
							});
						} else {
							var it = {
								"name": _keysParams[kp],
								"in": "query",
								"required": true,
								"type": "string",
							};
							if (typeof t[_keysParams[kp]] === "object")
								it = _.extend(it, t[_keysParams[kp]]);
							loacalSwaggerAPI.paths["/" + _key2 + ""].get.parameters.push(it);
						}
					}

				}
				//overwrite lambda in swagger TODO: Deprecate swagger lambda definition
				resource.lambda = config.lambda;

				if (typeof t === 'object') {
					t.ENV = "$stageVariables.ENV";
					t.PROTECT_ENV = t.PROTECT_ENV || "$stageVariables.PROTECT_ENV";
					t.UNLOCK_LAMBDA_EXEC = t.UNLOCK_LAMBDA_EXEC || "$stageVariables.UNLOCK_LAMBDA_EXEC";
				}
				t = (t ? (typeof t === 'string' ? t : JSON.stringify(t)) : '{}');
				var u = "arn:aws:apigateway:" + config.region + ":lambda:path/2015-03-31/functions/arn:aws:lambda:" + config.region + ":" + config.account + ":function:" + resource.lambda + (environment === 'devel' ? '-devel' : '') + lambdaVersion + "/invocations";
				// console.log("Adding Permisions to lambda => ", u);
				swagger.paths[resource.path] = buildResourceConfig(u, t, rDef, rBody);
				// UNCOMENT
				permissionsCMD += buildPermission(resource, api_id);
			};
			// grunt.file.write(__dirname + '/AWS/apigateway/swagger.json', JSON.stringify(swagger));
			// grunt.file.write(__dirname + '/swagger.json', JSON.stringify(loacalSwaggerAPI)); //
			grunt.file.write(__dirname + '/AWS/apigateway/swagger.json', JSON.stringify(swagger, null, 4));
			grunt.file.write(__dirname + '/public/swagger.json', JSON.stringify(loacalSwaggerAPI, null, 4)); //
			console.log("Swagger File Generated Successfully!");

			// console.log('Permisssions => ', permissionsCMD);
		}


		function buildPermission(resource, api_id) {
			let path = resource.path.substring(1).split('/').join('_');
			if (path === "")
				return "";
			var cmd = "aws lambda remove-permission --function-name " + lambda_name + " --statement-id " + path + "_permission;\n";
			cmd += "aws lambda add-permission --function-name " + lambda_name + " --statement-id " + path + "_permission --action lambda:InvokeFunction --principal apigateway.amazonaws.com";
			cmd += " --source-arn arn:aws:execute-api:" + config.region + ":" + config.account + ":" + api_id + "/*/GET" + resource.path;
			cmd += ";";
			// console.log("CMD => ", cmd);
			return cmd;
		}

		function checkLambda(cb) {
			let exec = require('child_process').exec;
			let cmd = LAMBDA_BUILD_CMD_CLEAN + LAMBDA_BUILD_CMD + "aws lambda get-function --function-name " + lambda_name;
			console.log(("COMPRESING LAMBDA PACKAGE [" + PKG_NAME + "] AND SEARCHING LAMBDA ON AWS ...").magenta);
			exec(cmd, function (error, stdout, stderr) {
				// console.log("stderr ", stderr);
				if (error && stderr.indexOf("ResourceNotFoundException" > -1)) {
					console.log("\tLAMBDA not found in AWS\n".gray);
					// console.log("Error checkLambda:", error, stderr);
					createLambda(cb);
				} else if (error || stderr) {
					console.log("LAMBDA BUILD COMMAND ERROR:".red, "\n" + stderr.yellow);
					// console.log("Error check LAMBDA_BUILD_CMD_CLEAN: \n", cmd.red);
					throw new Error("Please check `deploy_cmds` values on config file");
				} else {
					// console.log("Response checkLambda\n", stdout);
					console.log("\tLAMBDA EXIST".gray, "\nPackage Created Successfully.");
					updateLambda(cb);
				}
			});
		}

		function createLambda(cb) {
			let exec = require('child_process').exec;
			let cmd = "aws lambda create-function --region " + config.region + " --function-name " + lambda_name + " --runtime " + config.lambda_runtime + " --role " + config.lambda_role + " --handler " + config.lambda_handler + " --zip-file fileb://" + PKG_NAME;
			cmd += "; " + LAMBDA_BUILD_CMD_CLEAN;
			console.log(("CREATING LAMBDA: " + lambda_name + " ...").magenta);
			exec(cmd, function (error, stdout, stderr) {
				if (error) {
					console.log("Error Creating Lambda:", error, stderr);
				} else {
					// console.log("Response createLambda:\n", stdout);
					console.log("Lambda Created OK\n");
					cb();
				}
			});
		}

		function updateLambda(cb) {
			let exec = require('child_process').exec;
			let cmd = "aws lambda update-function-code --function-name " + lambda_name + " --zip-file fileb://" + PKG_NAME;
			cmd += "; " + LAMBDA_BUILD_CMD_CLEAN;
			console.log(("UPDATING LAMBDA [" + PKG_NAME + "] => " + lambda_name + " ...\n").magenta);
			exec(cmd, function (error, stdout, stderr) {
				if (error) {
					console.log("Error Updating Lambda:".red, error, stderr);
				} else {
					// console.log("Lambda UPDATED", stdout);
					console.log("Lambda Updated OK\n");
					cb();
				}
			});
		}

		function checkAPI(cb) {
			let exec = require('child_process').exec;
			let cmd = "aws apigateway get-rest-apis";
			console.log(("LOOKING GATEWAY API-ID for: " + api_name));
			exec(cmd, function (error, stdout, stderr) {
				if (error) {
					// console.log("NOT EXIST\n".red);
					console.log("Error checkAPI:", error, stderr);
				} else {
					// console.log("Response checkLambda\n", stdout);
					// console.log("REST API EXIST\n".green);
					// getAPI_id(api_name, JSON.parse(stdout).items);

					let items = JSON.parse(stdout).items || [];
					let resp = "";
					for (let i in items) {
						// console.log("items[i]", items[i].name, (items[i].name === api_name));
						if (items[i].name === api_name) {
							if (resp !== "") {
								throw new Error("Iten name " + api_name + " is ambiguos. Go to AWS Console and rename one of the APIs.");
							} else {
								resp += items[i].id;
								console.log("\tAPI-ID found => ".gray, items[i].id.gray);
							}
						}
					}
					// api_id = resp;
					// console.log("getAPI_id =>", api_name, "  ", resp);
					if (resp === "") {
						createAPI(cb);
					} else {
						cb(resp);
					}
				}
			});
		}

		function createAPI(cb) {
			let exec = require('child_process').exec;
			let cmd = "aws apigateway create-rest-api --region " + config.region + " --name " + api_name + "  ";
			console.log(("CREATING REST API " + api_name + "...\n").gray);
			exec(cmd, function (error, stdout, stderr) {
				if (error) {
					console.log("Error Creating REST API:", error, stderr.red);
				} else {
					console.log(("REST API Created OK\n" + stdout).gray);
					checkAPI(cb);
				}
			});
		}

		// TODO: Clean removed resources
		function sendAPI(api_id) {
			if (send) {
				// var done = this.async();
				var exec = require('child_process').exec;
				var cmd = '';
				cmd = "aws apigateway put-rest-api --rest-api-id " + api_id + " --body 'file://./AWS/apigateway/swagger.json' --region " + config.region;
				console.log(("UPLOADING API: " + environment.toUpperCase() + " ... ").magenta);
				exec(cmd, function (error, stdout, stderr) {
					if (error)
						console.log("Error:", error.red, stderr.gray);
					else
						console.log("API Uploaded Successfully:\n");
					// console.log("Response:\n", JSON.parse(stdout));
					deployAPI(api_id);
				});
			}
		}

		function deployAPI(api_id) {
			if (send) {
				var exec = require('child_process').exec;
				var cmd = '';
				// aws apigateway get-stage --rest-api-id vtpo53alwa --stage-name v1 --region us-west-2
				cmd = "aws apigateway create-deployment --rest-api-id " + api_id + " --stage-name '" + config.version + "' --region " + config.region;
				cmd += " --no-cache-cluster-enabled  ";
				console.log(("DEPLOYING API into STAGE " + config.version + " ...").magenta);
				exec(cmd, function (error, stdout, stderr) {
					if (error)
						console.log("Error:", error.red, stderr.gray);
					else
						console.log("API Deployed Successfully\n");
					// console.log("Response:\n", JSON.parse(stdout));
					grantPermissions();
				});
			}
		}

		function grantPermissions() {
			var exec = require('child_process').exec;
			console.log("SENDING EXECUTION PERMISSIONS ...".magenta);
			exec(permissionsCMD, function (error, stdout, stderr) {
				if (error)
					console.log("Warning:".yellow, stderr.yellow);
				else
					console.log("Permisssions have been setted successfully\n");
				// console.log("Response:\n", stdout);
				done();
			});
		}

		var done = this.async();
		var send_all = grunt.option('deploy-all') || false;
		var send = (grunt.option('deploy') || grunt.option('deploy-all')) || false;

		if (send_all || send) {
			checkAPI(function (api_id) {
				// console.log("CALLING testOKKK => ", api_id);
				testOKKK(api_id);
				if (send_all) {
					checkLambda(function () {
						sendAPI(api_id);
					});
					// sendLambda();
				} else if (send) {
					sendAPI(api_id);
				}
			});
		} else {
			console.log('If you want send to aws you must to use [--deploy || --deploy-all] in your command.')
		}


	});

};
