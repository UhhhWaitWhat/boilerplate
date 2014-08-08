var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

var docs = fs.readdirAsync('docs').map(function(filename) {
	return fs.readFileAsync(path.join('docs', filename), 'utf8').then(function(content) {
		return {
			name: filename.split('.')[0],
			content: content
		}
	});
}).then(function(docs) {
	docs[0].selected = true;
	return {
		docs: docs,
		selected: docs[0]
	};
});

module.exports = function *() {
	return yield docs;
};