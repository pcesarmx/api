/*
 * @author: Paulo Ruvalcaba
 * @module: UTIL
 * @TODO Find a DOC GEN ...
 */


const deferred = require('deferred');
const unidecode = require('unidecode');
const config = require("../config")();
const _ = require("underscore");


const UTIL = {
	extend: _.extend,
	sortBy: _.sortBy,
	validateEmail: (email) => {
		let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	},
	removeAcentos: (str) => {
		try {
			let r = str.toLowerCase();
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
			for (let i in non_asciis) {
				r = r.replace(new RegExp(non_asciis[i], 'g'), i);
			}
			return r;
		} catch (err) {}
		return str;
	},
	findByKey: (array, key, value) => {
		for (let i = 0; i < array.length; i++) {
			if (array[i][key] === value) {
				return array[i];
			}
		}
		return null;
	},
	escape: (str) => {
		return (str + "").replace(/\\/g, "\\\\")
			.replace(/\$/g, "\\$")
			.replace(/'/g, "\\'")
			.replace(/"/g, "\\\"");
	},
	round: (num, places) => {
		if (!places)
			places = 4;
		return +(Math.round(num + "e+" + places) + "e-" + places);
		// return Math.round(num * 1000) / 1000;
	},
	// Limpia el formato de un # de telefono en USA
	extractPhone: (phone) => {
		try {
			// return phone.replace(/\-/g, '').replace(/"/g, "").replace(/'/g, "").replace(/\(|\)/g, "").replace(/ /g, "").slice(-10);
			return phone.match(/\d+/g).join('').slice(-10);
		} catch (err) {
			return phone;
		}
	},
	getDate: () => {
		try {
			return new Date().toString("yyyyMMddHHmmss").
			replace(/ T/, ' ').
			replace(/\..+/, '');
		} catch (err) {
			return new Date().toGMTString();
		}
	},
	parse: (attr) => {
		try {
			// let crappyJSON = attr;
			// let fixedJSON = crappyJSON.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
			// let aNiceObject = JSON.parse(fixedJSON);

			return JSON.parse(attr);
		} catch (err) {
			// console.log("ERROR PARSING => ", err);
			// return eval('(' + attr + ')');
			return attr;
		}
	},
	encodeMSG: (msg) => {
		try {
			// let m = myString = JSON.parse(JSON.stringify(msg));
			// let m = encodeURIComponent(msg);
			// let m = escape(msg);
			let m = unidecode(msg);
			// console.log("m => ", m);
			return m;
		} catch (err) {
			// console.log("ERR Sending MSG => ", msg);
			return msg;
		}
	},
	isEmptyJSON: (obj) => {
		// jQuery.isEmptyObject(objeto)
		for (let i in obj) {
			return false;
		}
		return true;
	},
};

module.exports = UTIL;
