var bunyan = require('bunyan');
var es = require('event-stream');
var dir = require('require-directory');

//Construct fake values for our testing. This allows us to drop the logging as well as force a port etc.
before(function() {
	global.PORT = 3000;
	global.NAME = 'Test';
	global.logger = bunyan.createLogger({
		name: 'Testing',
		//Drop our log stream
		stream: es.map(function(a,b){b();})
	});
	global.config = dir(module, '../config');
});