/*
 * @author: Paulo Ruvalcaba
 * @module: UTIL
 * @TODO Find a DOC GEN ...
 */


var deferred = require('deferred');
var unidecode = require('unidecode');
var config = require("../config")();
var _ = require("underscore");


var UTIL = {
	extend: _.extend,
	sortBy: _.sortBy,
	validateEmail: function (email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	},
	removeAcentos: function (str) {
		try {
			var r = str.toLowerCase();
			non_asciis = {
				'a': '[àáâãäå]',
				'ae': 'æ',
				'c': 'ç',
				'e': '[èéêë]',
				'i': '[ìíîï]',
				'n': 'ñ',
				'o': '[òóôõö]',
				'oe': 'œ',
				'u': '[ùúûűü]',
				'y': '[ýÿ]'
			};
			for (var i in non_asciis) {
				r = r.replace(new RegExp(non_asciis[i], 'g'), i);
			}
			return r;
		} catch (err) {}
		return str;
	},
	findByKey: function (array, key, value) {
		for (var i = 0; i < array.length; i++) {
			if (array[i][key] === value) {
				return array[i];
			}
		}
		return null;
	},
	escape: function (str) {
		return (str + "").replace(/\\/g, "\\\\")
			.replace(/\$/g, "\\$")
			.replace(/'/g, "\\'")
			.replace(/"/g, "\\\"");
	},
	round: function (num, places) {
		if (!places)
			places = 4;
		return +(Math.round(num + "e+" + places) + "e-" + places);
		// return Math.round(num * 1000) / 1000;
	},
	// Limpia el formato de un # de telefono en USA
	extractPhone: function (phone) {
		try {
			// return phone.replace(/\-/g, '').replace(/"/g, "").replace(/'/g, "").replace(/\(|\)/g, "").replace(/ /g, "").slice(-10);
			return phone.match(/\d+/g).join('').slice(-10);
		} catch (err) {
			return phone;
		}
	},
	getDate: function () {
		try {
			return new Date().toString("yyyyMMddHHmmss").
			replace(/ T/, ' ').
			replace(/\..+/, '');
		} catch (err) {
			return new Date().toGMTString();
		}
	},
	parse: function (attr) {
		try {
			// var crappyJSON = attr;
			// var fixedJSON = crappyJSON.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
			// var aNiceObject = JSON.parse(fixedJSON);

			return JSON.parse(attr);
		} catch (err) {
			// console.log("ERROR PARSING => ", err);
			// return eval('(' + attr + ')');
			return attr;
		}
	},
	encodeMSG: function (msg) {
		try {
			// var m = myString = JSON.parse(JSON.stringify(msg));
			// var m = encodeURIComponent(msg);
			// var m = escape(msg);
			var m = unidecode(msg);
			// console.log("m => ", m);
			return m;
		} catch (err) {
			// console.log("ERR Sending MSG => ", msg);
			return msg;
		}
	},
	isEmptyJSON: function (obj) {
		// jQuery.isEmptyObject(objeto)
		for (var i in obj) {
			return false;
		}
		return true;
	},
};

module.exports = UTIL;
