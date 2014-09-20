var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));
var _ = require('lodash');

//A function to read the projects gitignore and return an array of globs, which, when run through `multimatch`, will filter out anything not tracked by git.
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

		//We need to add a positive glob to let anything through. We should also ignore the `.git` directory
		prepared.unshift('**/*');
		prepared.push('!.git');
		prepared.push('!.git/**/*');

		//Remove duplicates
		return _.flatten(prepared, true);
	}).catch(function() {
		//If we caught an error (most likely because no `.gitignore` exists) just allow all files through.
		return ['**/*'];
	});
};