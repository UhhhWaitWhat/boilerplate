var watch = require('node-watch');
var sass = require('node-sass');
var path = require('path');
var prefixer = require('autoprefixer');
var logger = global.logger.child({module: 'assets', asset:'css'});

module.exports = function(src, dest) {
	var cache = '', time = new Date();

	render();

	watch(path.dirname(src), function() {
		render();
	});

	function render() {
		sass.render({
			file: src,
			success: function(result) {
				cache = prefixer.process(result).css;
				time = new Date();
				logger.info('Recompiled sass (and added prefixes)');
			},
			error: function(err) {
				logger.error('Failed to compile sass', err);
			}
		});
	}

	return function *(next) {
		if(this.path === dest) {
			this.body = cache;
			this.lastModified = time;
			this.type = 'text/css';
		} else {
			yield next;
		}
	}
}