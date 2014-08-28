logger.orm = global.logger.child({module: 'orm'});

var _ = require('lodash');
var path = require('path');
var Promise = require('bluebird');
var Waterline = require('waterline');

var adapter = require(config.orm.adapter);
var models = require('require-directory')(module, path.join(__dirname, '../models'));

/* Instantiate our ORM */
var waterline = new Waterline();

/* Normalize and load our models */
_(models).each(function(model, name) {
	model.identity = name.toLowerCase();
	model.connection = 'main';

	logger.orm.debug('Registering model "'+name+'"');
	waterline.loadCollection(Waterline.Collection.extend(model));
});

/* Export promise */
module.exports = new Promise(function(resolve, reject) {
	var adapters = {};
		adapters[config.orm.adapter] = adapter;

	/* Initialize our orm */
	waterline.initialize({
		adapters: adapters,
		connections: {
			main: config.orm
		}
	}, function(err, orm) {
		if(err) return reject(err);
		
		logger.orm.debug('ORM initialized with adapter "'+config.orm.adapter+'"');
		var ORM = _(orm.collections).reduce(function(sum, model, name) {
			var normalizedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
			sum[normalizedName] = model;
			return sum;
		}, {});

		resolve(ORM);
	});
});