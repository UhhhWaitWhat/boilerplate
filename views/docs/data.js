var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

var docs = fs.readdirAsync('docs').reduce(function(sum, filename) {
	return fs.readFileAsync(path.join('docs', filename), 'utf8').then(function(content) {
		sum[filename.split('.')[0]] = content;
		return sum;
	});
}, {});

module.exports = function *(doc) {
	var data = yield docs;
	if(!doc) {
		this.redirect(this.path + '/' + Object.keys(data)[0]);
	} else {
		return {
			files: Object.keys(data).map(function(el) {
				return {
					name: el,
					selected: el === doc
				}
			}),
			contents: data[doc]
		};
	}
};