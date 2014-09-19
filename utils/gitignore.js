var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));
var _ = require('lodash');

module.exports = function gitignoreGlob() {
	return fs.readFileAsync('.gitignore', 'utf8').then(function(gitignore) {
		var lines = gitignore.split('\n');
		var prepared = lines.map(function(line) {
			if(line[0] === '/') line = line.substring(1);
			return [
				'!' + line,
				'!' + line + '/**/*'
			];
		});

		prepared.unshift('**/*');
		prepared.push('!.git');
		prepared.push('!.git/**/*');
		return _.flatten(prepared, true);
	}).catch(function() {
		return ['**/*'];
	});
};