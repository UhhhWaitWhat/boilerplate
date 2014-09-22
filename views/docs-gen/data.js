'use strict';
var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));
var gitignore = require('../../utils/gitignore')();
var multimatch = require('multimatch');
var path = require('path');
var docco = require('docco');
var cache = {};

//Main middleware function
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

//Do we have a valid file or folder?
//We check if the file exists and, if it is a file, if it ends on `.js`
//In addition it should not be part of our `.gitignore`
function *valid(pth) {
	var stat;
	try {
		stat = yield fs.lstatAsync(pth);
	} catch(e) {
		return false;
	}

	if(pth === '.') return true;
	if(!stat.isDirectory() && !(stat.isFile() && path.extname(pth) === '.js')) {
		return false;
	} else {
		return multimatch([pth], yield gitignore, {dot: true}).length>0;
	}
}

//Return an object with all children for a given path
function *generateChildren(pth) {
	var folder = true;

	//Normalize path to the nearest folder
	pth = './'+pth;
	if(path.extname(pth) === '.js') {
		folder = false;
		let parts = pth.split(path.sep);
		parts.pop();
		pth = parts.join(path.sep);
	}

	//Filter out anything on our gitignore
	var git = yield gitignore;
	var all = yield fs.readdirAsync(pth);
	all = all.map(function(name) {
		return path.join(pth, name);
	});
	all = multimatch(all, git, {dot: true});

	//Get the stats to filter files from directories	
	var stats = yield all.map(function(name) {
		return fs.lstatAsync(name);
	});

	var files = all.filter(function(name, i) {
		return path.extname(name) === '.js' && stats[i].isFile();
	});
	var folders = all.filter(function(name, i) {
		return stats[i].isDirectory();
	});

	//Construct and return the object
	return {
		folder: folder,
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