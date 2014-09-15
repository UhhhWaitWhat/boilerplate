var _ = require('lodash');
//Enable sensible stacktraces for promises
process.env.BLUEBIRD_DEBUG = 1;

//Makes config, services, logger and environment available globally
module.exports = function() {
	global.NAME = require('../package.json').name;
	global.BASEPATH = process.env.BASEPATH || '';
	global.DEV = process.env.NODE_ENV !== 'production';
	global.logger = require('bunyan').createLogger({
		name: NAME,
		level: DEV ? 'trace' : 'info',
		src: DEV
	});
	global.config = require('require-directory')(module, '../config');
	global.services = _(require('require-directory')(module, '../services')).transform(function(obj, el, key) {
		obj[key] = el();
	}).value();
};