var bunyan = require('bunyan');
var es = require('event-stream');
var dir = require('require-directory');

before(function() {
	global.NAME = 'Test';
	global.logger = bunyan.createLogger({
		name: 'Testing',
		stream: es.map(function(a,b){b();})
	});
	global.config = dir(module, '../config');
});