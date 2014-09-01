var watchify = require('watchify');
var logger = global.logger.child({module: 'assets', asset:'js'});

module.exports = function(src, dest, excludeHbs) {
	//Setup our cache, timestamp and watchify instance
	var cache = '', time = new Date();
	var w = watchify({
		entries: src
	});

	//Run the initial bundle and listen for updates
	bundle();
	w.on('update', bundle);

	//Exclude handlebars, if needed, so we use the handlebars instance which has our helpers attached
	//Then bundle the files, update the timestamp and log our success/failure
	function bundle() {
		if(excludeHbs) w.exclude('handlebars');
		w.bundle(function(err, bundle) {
			if(!err) {
				cache = bundle;
				time = new Date();
				logger.info('Rebuilt js bundle');
			} else {
				logger.warn('Failed to build js bundle', err);
			}
		});
	}

	//Return a middleware generator function to serve our cached bundle upon request
	return function *(next) {
		if(this.path === dest) {
			this.body = cache;
			this.lastModified = time;
			this.type = 'text/javascript';
		} else {
			yield next;
		}
	};
};