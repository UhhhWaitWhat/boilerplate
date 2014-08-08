var fs = require('fs');
var path = require('path');
var bower = require('main-bower-files');
var watch = require('node-watch');
var combinedStream = require('combined-stream');
var concatStream = require('concat-stream');
var es = require('event-stream');
var send = require('koa-send');

module.exports = function(destJs, destCss, destAssets) {
	var files = [], js = '', css = '', time = new Date(), bowerLoc = bowerLocation();

	bundle();
	watch(bowerLoc, function() {
		bundle();
	});

	function bundle() {
		var src = files = bower();
		var jsStream = combinedStream.create();
		var cssStream = combinedStream.create();

		var jsConcat = concatStream(function(data) {
			js = data.toString();
			time = new Date();
		});

		var cssConcat = concatStream(function(data) {
			css = data.toString();
			time = new Date();
		});

		src.forEach(function(entry) {
			var stream = fs.createReadStream(path.join(process.cwd(), entry));

			if(entry.substr(entry.length-3) === '.js') {
				jsStream.append(stream);
			} else if(entry.substr(entry.length-4) === '.css') {
				cssStream.append(stream.pipe(es.map(rewriteUrl(entry))));
			}
		});

		jsStream.pipe(jsConcat);
		cssStream.pipe(cssConcat);
	}

	function rewriteUrl(filename) {
		var regex = /url\(['"](.*?)['"]\)/g;
		var basepath = filename.replace(bowerLoc, destAssets).split('/');
			basepath.pop();
			basepath = basepath.join('/');

		return function(data, cb) {
			var str = data.toString();
			var result = str.replace(regex, function() {
				var srcUrl = arguments[1];
				var targetURL = basepath + '/' + srcUrl;

				return 'url("'+targetURL+'")';
			});
			cb(null, result);
		}
	}

	return function *(next) {
		if(this.path === destJs) {
			this.body = js;
			this.lastModified = time;
			this.type = 'text/javascript';
		} else if (this.path === destCss) {
			this.body = css;
			this.lastModified = time;
			this.type = 'text/css';
		} else {
			var asset = path.join(bowerLoc, this.path.substr(destAssets.length));
			if(files.indexOf(asset) !== -1) {
				var pth = path.join(process.cwd(), asset);
				yield send(this, pth);
			} else {
				yield next;
			}
		}
	}
}

function bowerLocation() {
	try {
		return JSON.parse(fs.readFileSync('.bowerrc', 'utf8')).directory
	} catch(e) {
		return 'bower_components';
	}
}