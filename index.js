//Enable sensible stacktraces for promises
process.env.BLUEBIRD_DEBUG = 1;

var program = require('commander');
var inquirer = require('inquirer');
var pkg = require('./package.json');

//Makes config, services, logger and environment available globally
function setup() {
	global.NAME = require('./package.json').name;
	global.DEV = process.env.NODE_ENV !== 'production';
	global.logger = require('bunyan').createLogger({
		name: NAME,
		level: DEV ? 'trace' : 'info',
		src: DEV
	});
	global.config = require('require-directory')(module, './config');
	global.services = require('require-directory')(module, './services');
}

//Setup our cli
program.version(pkg.version);

//Start the main application
program
	.command('start')
	.description('Start the server')
	.action(function() {
		setup();
		require('./server.js');
	});

//Allow adding of a new user
program
	.command('add')
	.description('Add a new user')
	.action(function() {
		process.env.NODE_ENV = 'production';
		setup();
		services.orm.then(function(ORM) {
			//Query for username and password
			inquirer.prompt([{type: 'string', name: 'name', message: 'Enter a username'}, {type: 'password', name: 'password', message: 'Enter a password:'}], function(data) {
				//Create the user
				ORM.User.create({name: data.name, password: data.password}).then(function(user) {
					console.log('Added User "' + user.name + '"!');
				});
			});
		});
	});

program.parse(process.argv);