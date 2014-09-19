'use strict';
var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));
var gitignore = require('../../utils/gitignore')();
var multimatch = require('multimatch');
var path = require('path');
var docco = require('docco');
var cache = {};

module.exports = function *() {
	var pth = Array.prototype.slice.call(arguments, 0, arguments.length-1).join('');
	pth = path.normalize(pth);

	if(!(yield valid(pth))) {
		this.status = 404;
		return;
	}

	var result = yield generateChildren(pth);
	result.folder = path.extname(pth) !== '.js';
	result.path = generateBreadcrumbs(pth, BASEPATH+'/docs/generated');
	result.data = result.folder ? [] : yield generateData(pth);

	return result;
};

function *valid(pth) {
	var stat;
	try {
		stat = yield fs.lstatAsync(pth);
	} catch(e) {
		return false;
	}

	if(!stat.isDirectory() && !(stat.isFile() && path.extname(pth) === '.js')) {
		return false;
	} else {
		return multimatch([pth], yield gitignore);
	}
}

function *generateChildren(pth) {
	pth = './'+pth;
	if(path.extname(pth) === '.js') {
		let parts = pth.split(path.sep);
		parts.pop();
		pth = parts.join(path.sep);
	}

	var git = yield gitignore;
	var all = yield fs.readdirAsync(pth);
	all = all.map(function(name) {
		return path.join(pth, name);
	});
	all = multimatch(all, git);

	var stats = yield all.map(function(name) {
		return fs.lstatAsync(name);
	});

	var files = all.filter(function(name, i) {
		return path.extname(name) === '.js' && stats[i].isFile();
	});
	var folders = all.filter(function(name, i) {
		return stats[i].isDirectory();
	});

	return {
		files: files.map(function(file) {
			return {
				name: path.basename(file)
			};
		}),
		folders: folders.map(function(folder) {
			return {
				name: path.basename(folder)
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