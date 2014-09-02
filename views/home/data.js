var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));

//Load the readme in promise form
var readme = fs.readFileAsync('README.md', 'utf8');

module.exports = function *() {
	return {
		readme: yield readme
	};
};