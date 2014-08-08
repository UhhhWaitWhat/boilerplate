var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

var readme = fs.readFileAsync('README.md', 'utf8');

module.exports = function *() {
	return {
		readme: yield readme
	};
};