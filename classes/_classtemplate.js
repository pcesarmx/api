/*
 * @author: My NAME
 * @module: __
 * @TODO Find a DOC GEN ...
 */

const deferred = require('deferred');
const config = require("../config")()._config_;

if (!config) {
	throw new Error("__ CLASS ERROR: NO CONFIGURATION SETTINGS FOUND");
}

const __ = {
	test: () => {
		return "OKK";
	},
	send: (params) => {
		let def = deferred();

		def.reject(error);
		def.resolve(info);

		return def.promise;
	}
};

module.exports = __;
