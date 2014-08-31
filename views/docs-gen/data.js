'use strict';
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var glob = require('glob');
var multimatch = require('multimatch');
var path = require('path');
var _ = require('lodash');

var files = allFiles();
var cache = {};

module.exports = function *(pth) {
	pth = pth || '';
	var base = this.path.substring(0, this.path.length-pth.length);
	pth = path.normalize(pth);
	if(pth[0] === '/') pth = pth.substring(1);
	if(pth[pth.length-1] === '/') pth = pth.substring(0, pth.length-1);
	if(base[base.length-1] === '/') base = base.substring(0, base.length-1);

	var available = yield files;
	if(available.indexOf(pth) === -1) {
		if(pth.substring(pth.length-3) === '.js') {
			this.status = 404;
		} else {
			this.redirect(base + '/' + (yield closest(pth)));
		}
	} else {
		var children = yield generateChildren(pth);
		return {
			path: generateBreadcrumbs(pth, base),
			folders: children.folders,
			files: children.files
		};
	}
};

function *closest(pth) {
	var available = yield files;
	var parts = pth.split(path.sep);

	for(let x = parts.length-1; x >= 0; x--) {
		let current = parts.join('/');
		let match = multimatch(available, [current+'/**/*']);
		
		if(match.length > 0) {
			return match[0];
		} else {
			parts.pop();
		}
	}

	return available[0];
}

function *generateChildren(pth) {
	pth = pth.split(path.sep).slice(0, -1).join('/');
	var available = yield files;
	var fils = multimatch(available, [pth+'/*.js']);
	var folders = _(multimatch(available, [pth+'/*/*.js'])).map(function(entry) {
		return entry.split('/').slice(pth.split('/').length, pth.split('/').length+1)[0];
	}).uniq().value();
	
	return {
		files: fils.map(function(file) {
			return {
				name: file.split('/')[file.split('/').length-1],
				selected: false
			};
		}),
		folders: folders.map(function(folder) {
			return {
				name: folder
			};
		})
	};
}

function generateBreadcrumbs(pth, base) {
	return pth.split(path.sep).reduce(function(sum, crumb) {
		sum.push({
			name: crumb,
			path: sum[sum.length-1].path + '/' + crumb,
			last: true
		});
		delete sum[sum.length-2].last;
		return sum;
	}, [{
		name: '/',
		path: base,
		last: true
	}]);
}

function allFiles() {
	return fs.readFileAsync('.gitignore', 'utf8').then(function(gitignore) {
		return gitignore.split('\n').reduce(function(sum, el) {
			if(el[0] === '/') el = el.substring(1);
			sum.push('!' + el);
			sum.push('!' + el + '/**/*');
			return sum;
		}, ['**/*']);
	}).catch(function() {
		return ['**/*'];
	}).then(function(gitignore) {
		return Promise.promisify(glob)('**/*.js').then(function(files) {
			return [files, gitignore];
		});
	}).spread(multimatch);
}