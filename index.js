var setup = require('./server/setup');
var program = require('commander');
var inquirer = require('inquirer');
var pkg = require('./package.json');

//Setup our cli
program.version(pkg.version);

//Start the main application
program
	.command('start')
	.description('Start the server')
	.action(function() {
		setup();
		require('./server/koa.js');
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
			inquirer.prompt([{type: 'string', name: 'name', message: 'Enter a username'}, {type: 'password', name: 'password', message: 'Enter a password'}], function(data) {
				//Create the user
				ORM.User.create({name: data.name, password: data.password}).then(function(user) {
					console.log('Added User "' + user.name + '"!');
				});
			});
		});
	});

program.parse(process.argv);