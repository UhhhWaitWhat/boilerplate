var watchify = require('watchify');
var logger = global.logger.child({module: 'assets', asset:'js'});

module.exports = function(src, dest, excludeHbs) {
	var cache = '', time = new Date();
	var w = watchify({
		entries: src
	});

	w.on('update', bundle);
	bundle();

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

	return function *(next) {
		if(this.path === dest) {
			this.body = cache;
			this.lastModified = time;
			this.type = 'text/javascript';
		} else {
			yield next;
		}
	}
}