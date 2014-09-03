var fs = require('fs');
var orm = require('../../services/orm');

describe('ORM Service', function() {
	describe('after load', function() {
		var instance;
		before(function() {
			instance = orm();
		});

		it('returns a promise', function() {
			instance.must.be.instanceOf(Promise);
		});

		it('assigns models', function *() {
			var files = fs.readdirSync('models');
			var orm = yield instance;
			files.forEach(function(file) {
				orm.must.have.enumerableProperty(file.substring(0,1).toUpperCase() + file.substring(1, file.length-3).toLowerCase());
			});
		});
	});
});