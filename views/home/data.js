var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

//Load the readme in promise form
var readme = fs.readFileAsync('README.md', 'utf8');

module.exports = function *() {
	return {
		readme: yield readme
	};
};