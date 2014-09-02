var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

//Read the contents of the `docs` folder asynchronously.
//Then we load each file and attach it to a `sum` object, which we then pass through to the view
var docs = fs.readdirAsync('docs').reduce(function(sum, filename) {
	return fs.readFileAsync(path.join('docs', filename), 'utf8').then(function(content) {
		sum[filename.split('.')[0]] = content;
		return sum;
	});
}, {});

//Fetch the requested file and return it in addition to a file list
module.exports = function *(doc) {
	var data = yield docs;

	//If the file does not exist, redirect to the first existing one
	if(!doc) {
		this.redirect(path.join(this.path, Object.keys(data)[0]).split(path.sep).join('/'));
	} else {
		return {
			//Map filenames, so we can signal which one should be selected in the sidebar
			files: Object.keys(data).map(function(el) {
				return {
					name: el,
					selected: el === doc
				};
			}),
			//Also send file contents
			contents: data[doc]
		};
	}
};