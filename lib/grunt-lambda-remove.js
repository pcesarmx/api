/** Class representing the commands to remove the serverless deploy */
class GruntLambdaDeploy {
	/**
	 * Runs the necessary AWS CLI Commands to remove the lambda funtion and the gateway deploy
	 * @constructor
	 * @param {object} grunt - The grunt task object.
	 * @param {object} done - The async handler to end the process.
	 * @param {string} __dirnameRoot - The root folder path.
	 */
	constructor(grunt, done, __dirnameRoot) {
		// this._config = config;
		const config = require('../config')().APIGATEWAY;
		let lambdaVersion = "";
		const environment = config.environment || 'devel';
		const lambda_name = config.lambda + (environment === 'devel' ? '-devel' : '') + lambdaVersion;
		const api_name = lambda_name;
		let permissionsCMD = "";

		// console.log("LAMBDA_BUILD_CMD => ", LAMBDA_BUILD_CMD);

		function setupParams(api_id) {
			let endpoints = grunt.file.readJSON(__dirnameRoot + '/apigateway.swagger.config.json');
			console.log(("READING API INFORMATION FROM `" + environment.toUpperCase() + "` SWAGGER FILE ... ").magenta);
			if (!(environment === 'devel' || environment === 'production')) {
				console.log('Environment [--env] only can be "devel" or "production", so, using [DEFAULT = devel]');
				environment = 'devel';
			}
			if (!api_id) {
				console.log("Warning:\nAPI NOT FOUND, SKIPPING PARAMETERS!!".yellow);
			} else {
				console.log(("\tHOST => " + api_id + "." + endpoints.host).yellow);
			}

			if (config.lambda_version && config.lambda_version.length > 0) {
				lambdaVersion = ":" + config.lambda_version;
				console.log("Link to Lambda has been forced to version =>", config.lambda_version);
			}

			for (let key in endpoints.resources) {
				let resource = endpoints.resources[key];
				console.log(("\t\t|| endpoint => " + endpoints.resources[key].path).yellow);
				resource.lambda = config.lambda;
				permissionsCMD += buildPermission(resource);
			};
			// console.log("Permisions Command OK");
			// console.log('Permisssions => ', permissionsCMD);
		}



		function buildPermission(resource) {
			let path = resource.path.substring(1).split('/').join('_');
			if (path === "")
				return "";
			let cmd = "aws lambda remove-permission --function-name " + lambda_name + " --statement-id " + path + "_permission;\n";
			// console.log("CMD => ", cmd);
			return cmd;
		}

		function deleteLambda(cb) {
			let exec = require('child_process').exec;
			let cmd = "aws lambda delete-function --function-name " + lambda_name + ";";
			console.log(("DELETING LAMBDA " + lambda_name + " ...").magenta);
			exec(cmd, function (error, stdout, stderr) {
				if (error) {
					console.log("Warning:\nLAMNDA NOT FOUND".yellow);
					// console.log("Error Deleting Lambda:".red, error, stderr);
				} else {
					// console.log("Lambda UPDATED", stdout);
					console.log("Lambda Deleted Successfully");
				}
				cb();
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
						console.log("API not found!".gray);
						cb();
					} else {
						cb(resp);
					}
				}
			});
		}

		function deleteAPI(api_id) {
			console.log(("\nREMOVING API FROM AWS ...").magenta);
			if (!api_id) {
				console.log("Warning:\nAPI not found!".yellow);
				done();
				return;
			}

			let exec = require('child_process').exec;
			let cmd = '';
			// aws apigateway get-stage --rest-api-id vtpo53alwa --stage-name v1 --region us-west-2
			cmd = "aws apigateway delete-rest-api --rest-api-id " + api_id;
			exec(cmd, function (error, stdout, stderr) {
				if (error)
					console.log("Error:\n".red, error.red, stderr.red);
				else
					console.log("API Removed Successfully\n");
				// console.log("Response:\n", JSON.parse(stdout));
				// removePermissions();
				done();
			});
		}

		function removePermissions(cb) {
			let exec = require('child_process').exec;
			console.log("\nREMOVING EXECUTION PERMISSIONS FROM AWS ...".magenta);
			// console.log("permissionsCMD => ", permissionsCMD);
			exec(permissionsCMD, function (error, stdout, stderr) {
				if (error)
					console.log("Warning:".yellow, stderr.yellow);
				else
					console.log("Permisssions have been removed from aws successfully\n");
				// console.log("Response:\n", stdout);
				cb();
			});
		}

		// let done = this.async();
		let delete_all = grunt.option('all') || false;
		let remove = (grunt.option('api') || grunt.option('all')) || true; // default

		if (delete_all || remove) {
			checkAPI(function (api_id) {
				console.log("CALLING setupParams => ", api_id);
				setupParams(api_id);

				let callback;
				if (delete_all) {
					callback = function () {
						deleteLambda(function () {
							deleteAPI(api_id);
						});
					}
				} else if (remove) {
					callback = function () {
						deleteAPI(api_id);
					}
				}
				removePermissions(callback);
			});
		} else {
			console.log('If you want send to aws lambda you must to use [--deploy || --deploy-all] in your command.')
		}

	}

}

module.exports = GruntLambdaDeploy;
