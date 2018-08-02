/*
 * @author: Paulo Ruvalcaba
 * @module: __
 * @TODO Find a DOC GEN ...
 */

var deferred = require('deferred');
var config = require("../config")()._config_;

if (!config) {
	throw new Error("__ CLASS ERROR: NO CONFIGURATION SETTINGS FOUND");
}

var __ = {
	send: function (params) {
		var def = deferred();

		def.reject(error);
		def.resolve(info);

		return def.promise;
	}
};

module.exports = __;
