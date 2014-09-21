var _ = require('lodash');
var dir = require('require-directory');

//Enable sensible stacktraces for promises
process.env.BLUEBIRD_DEBUG = 1;

//Makes config, services, logger and environment available globally
module.exports = function() {
	global.NAME = require('../package.json').name;
	global.PORT = process.env.PORT || 3000;
	global.BASEPATH = process.env.BASEPATH || '';
	global.DEV = process.env.NODE_ENV !== 'production';
	global.logger = require('bunyan').createLogger({
		name: NAME,
		level: DEV ? 'trace' : 'info',
		src: DEV
	});
	global.config = dir(module, '../config');
	global.services = _(dir(module, '../services')).transform(function(obj, el, key) {
		obj[key] = el();
	}).value();

	logger.info('Setup completed');
};