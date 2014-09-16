'use strict';
var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));
var glob = require('glob');
var multimatch = require('multimatch');
var path = require('path');
var docco = require('docco');

var paths = allFiles();
var cache = {};

module.exports = function *() {
	var pth = Array.prototype.slice.call(arguments, 0, arguments.length-1).join('');
	var base = this.path.substring(0, this.path.length-pth.length);
	if(pth[0] === '/') pth = pth.substring(1);
	pth = path.normalize(pth).split(path.sep).join('/');

	var available = yield paths;
	if(available.indexOf(pth) !== -1 || pth === '.') {
		return yield run(pth);
	} else if(available.indexOf(pth+'/') !== -1) {
		return yield run(pth+'/');
	} else {
		this.status = 404;
	}

	function *run(pth) {
		var children = yield generateChildren(pth);
		return {
			path: generateBreadcrumbs(pth, base),
			folders: children.folders,
			files: children.files,
			folder: path.extname(pth) === '.js',
			data: path.extname(pth) === '.js' ? yield generateData(pth) : []
		};
	}
};

function *generateChildren(pth) {
	var available = yield paths;
	var parent = pth.split(path.sep).slice(0, -1).join('/');
	var current = path.extname(pth) === '.js' ? parent : pth;
	current = (current === '.' || current === '' ? '' : current + '/');
	var files = multimatch(available, [current+'*.js']);
	var folders = multimatch(available, [current+'*/']);

	return {
		files: files.map(function(file) {
			return {
				name: file.split('/')[file.split('/').length-1],
				selected: false
			};
		}),
		folders: folders.map(function(folder) {
			return {
				name: folder.split('/')[folder.split('/').length-2]
			};
		})
	};
}

function *generateData(pth) {
	cache[pth] = cache[pth] || docco.parse(pth, yield fs.readFileAsync(pth, 'utf8'), {languages: {}});
	return cache[pth];
}

function generateBreadcrumbs(pth, base) {
	var crumbs = pth.split(path.sep).reduce(function(sum, crumb) {
		if(crumb.length > 0 && crumb !== '.') {
			sum.push({
				name: crumb,
				path: sum[sum.length-1].path + crumb + '/',
				last: true
			});
			delete sum[sum.length-2].last;
		}
		return sum;
	}, [{
		name: '/',
		path: base+'/',
		last: true
	}]);

	var last = crumbs[crumbs.length-1];
	last.path = path.extname(last.path) === '.js' ? last.path.substring(0, last.path.length-1) : last.path;

	return crumbs;
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
		return bluebird.promisify(glob)('**/*.js').then(function(files) {
			return bluebird.promisify(glob)('**/*/').then(function(folders) {
				return folders.concat(files);
			});
		}).then(function(files) {
			return [files, gitignore];
		});
	}).spread(multimatch);
}