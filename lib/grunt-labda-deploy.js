// Compatible calss with AWS lambda
class Context {
	// set localhosturl(url) {
	// 	this._localhosturl = url;
	// }
	// get localhosturl() {
	// 	return this._localhosturl;
	// }

	set isDeferred(value) {
		// console.log("ACTIVATING SETTER", value);
		this._isDeferred = value;
	}
	get isDeferred() {
		return this._isDeferred;
	}

	set testingParams(value) {
		this._testingParams = JSON.stringify(value);
	}
	get testingParams() {
		return this._testingParams;
	}

	constructor(res, config) {
		// this._config = config;
		if (!res)
			throw new Error("1001 - Initialization Error: Invalid Arguments");
		this._res = res;
		this._log_debug = config.log_debug || false;
		this._log_context = config.log_context || false;

		this.isDeferred = false; // Test
		this.testingParams = {};
		this.deferred = false;
		// this.localhosturl = "";
		// console.log("Context Initalized**************");
	}

	done(error, result) {
		if (error === null) {
			this.succeed(result);
		} else {
			this.fail(error);
		}
		//console.log(this.deferred);
	}

	succeed(result) {
		if (this._log_context) {
			console.log("");
			console.log("Success!  Message:");
			console.log("------------------");
			console.log(result);
		}

		if (this._isDeferred) {
			if (this._log_debug) console.log("Resolving deferred method");
			// result.inputTested = this.testingParams;
			// console.log(this.testingParams);
			this.deferred.resolve({
				'testingParams': this.testingParams,
				'testResult': result
			});
			// delete this;
		} else if (this._res && !this._res.headersSent) {
			this._res.status(200).send(result);
			this._res = null;
		}
		// done(true);
	}

	fail(error) {
		// console.log("THIS", this);
		if (this._log_context) {
			console.log('\x1b[31m');
			console.log("Failure!  Message:");
			console.log("------------------");
			console.log(error);
			console.log('\x1b[0m');
		}

		if (this._res && !this._res.headersSent) {
			this._res.status(400).send(error);
			this._res = null;
		}
		// done(false);
	}
}

module.exports = Context;
