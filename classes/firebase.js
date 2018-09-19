/*
 * Paulo Ruvalcaba FIREBASE
 */
var deferred = require('deferred');
var firebase3 = require("firebase");
var configFB3 = require("../config")().FIREBASE;
//
var admin = require("firebase-admin");
var serviceAccount = require("../" + configFB3.serviceAccount);
console.log("configFB3", configFB3.databaseURL);
if (!configFB3) {
	throw new Error("FIREBASE_CLASS ERROR: NO CONFIGURATION SETTINGS FOUND");
}

var FB = {
	init: function () {
		var exist = this.isExistingApp(null);
		// console.log("EXIST => ", exist);
		if (!exist) {
			firebase3.initializeApp(configFB3, configFB3.appName);
			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount),
				databaseURL: configFB3.databaseURL
			});
		}

	},
	isExistingApp: function (name) {
		var appExists = false;
		name = name || configFB3.appName;
		firebase3.apps.forEach(function (app) {
			if (app.name === name) {
				appExists = true;
			}
		});
		return appExists;
	},
	generateToken: function (name, uid, data) {
		var def = deferred();
		admin.auth().createCustomToken(uid, {
				// "exp": 3600
			}).then(function (customToken) {
				def.resolve(customToken);
			})
			.catch(function (error) {
				def.reject('Error creating custom token:', error);
			});
		return def.promise;
	},
	listen: function (path, on_event, callback) {
		var ref = firebase3.app(configFB3.appName).database().ref().child(path);
		ref.on(on_event, callback);
		return ref;
	},
	read: function (path) {
		var def = deferred();
		firebase3.app(configFB3.appName).database().ref(path).on('value', function (snapshot) {
			def.resolve(snapshot.val());
		}, function (error) {
			def.reject('Firebase: Read failed', error);
		});
		return def.promise;
	},
	update: function (path, snapshot) {
		var def = deferred();
		firebase3.app(configFB3.appName).database().ref(path).update(snapshot).then(function (resp) {
			def.resolve("Firebase: Updated succeeded");
		}).catch(function (error) {
			def.reject('Firebase: Update failed', error);
		});
		return def.promise;
	},
	write: function (path, snapshot) {
		var def = deferred();
		console.log("snapshot", snapshot);
		firebase3.app(configFB3.appName).database().ref(path).set(snapshot).then(function (resp) {
			def.resolve("Firebase: Write succeeded");
		}).catch(function (error) {
			def.reject('Firebase: Write failed', error);
		});
		return def.promise;
	},
	push: function (path, snapshot) {
		var def = deferred();
		var newChildRef = firebase3.app(configFB3.appName).database().ref().child(path).push(snapshot).then(function (resp) {
			def.resolve(resp.key);
		}).catch(function (error) {
			def.reject('Firebase: Push failed', error);
		});
		return def.promise;
	},
	remove: function (path) {
		var def = deferred();
		var ref = firebase3.app(configFB3.appName).database().ref().child(path).remove().then(function (error) {
			if (error) {
				def.reject('Firebase: Remove failed', error);
			} else {
				def.resolve('Firebase: Remove succeeded');
			}
		});
		return def.promise;
	},
	findBy: function (path, key, value, bypass) {
		var def = deferred();
		var ref = firebase3.app(configFB3.appName).database().ref().child(path);
		ref.orderByChild(key)
			.equalTo(value)
			.once('value', function (snapshot) {
				var resp = [];
				if (!bypass) {
					snapshot.forEach(function (node) { //forEach is synchronous
						var item = node.val();
						item.key = node.key;
						resp.push(item);
						// console.log(item);
						// console.log(node.key;
					});
				} else {
					resp = snapshot.val();
				}

				def.resolve(resp);
			}, function (errorObject) {
				def.reject('Firebase: Read failed', error);
			});
		return def.promise;
	}
};

function isEmptyJSON(obj) {
	try {
		if (typeof obj === 'object')
			for (var i in obj) {
				return false;
			}
		else
			return obj === undefined;
	} catch (err) {}
	return true;
}

FB.init();

module.exports = FB;
