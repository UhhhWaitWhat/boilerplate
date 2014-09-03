var _ = require('lodash');
var path = require('path');
var Waterline = require('waterline');
var models = require('require-directory')(module, path.join(__dirname, '../models'));

module.exports = function() {
	//Get our adapter
	var adapter = require(config.orm.adapter);

	//Subclass our logger so we have more useful output
	logger.orm = global.logger.child({module: 'orm'});

	//Instantiate our ORM
	var waterline = new Waterline();

	//Normalize and load our models
	_(models).each(function(model, name) {
		model.identity = name.toLowerCase();
		model.connection = 'main';

		logger.orm.debug('Registering model "'+name+'"');
		waterline.loadCollection(Waterline.Collection.extend(model));
	});

	//Export a promise, so we can easily yield this later as
	//	var orm = yield services.orm
	//without actually instanciating it multiple times
	return new Promise(function(resolve, reject) {
		var adapters = {};
			adapters[config.orm.adapter] = adapter;

		//Initialize our orm 
		waterline.initialize({
			adapters: adapters,
			connections: {
				main: config.orm
			}
		}, function(err, orm) {
			if(err) return reject(err);
			
			//Assign all our capitalized collections to a new object
			var ORM = _(orm.collections).reduce(function(sum, model, name) {
				var normalizedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
				sum[normalizedName] = model;
				return sum;
			}, {});

			logger.orm.debug('ORM initialized with adapter "'+config.orm.adapter+'"');
			resolve(ORM);
		});
	});
};