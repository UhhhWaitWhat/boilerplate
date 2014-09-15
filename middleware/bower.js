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

	//Create the bundles for the first time and watch the bower location for changes
	bundle();
	watch(bowerLoc, function() {
		bundle();
	});

	//Bundle our files together into the smallest possible outputs.
	//We create streams to combine all files and then pipe those into a concatstream.
	//We also timestamp the creation of our files for caching purposes
	function bundle() {
		files = bower();
		var src = files;
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
			var stream = fs.createReadStream(path.join(entry));

			if(entry.substr(entry.length-3) === '.js') {
				jsStream.append(stream);
			} else if(entry.substr(entry.length-4) === '.css') {
				cssStream.append(stream.pipe(es.map(rewriteUrl(entry))));
			}
		});

		jsStream.pipe(jsConcat);
		cssStream.pipe(cssConcat);
	}

	//Rewrite urls in css files
	//This is required, as we do not store bower assets relative to the bundled css
	function rewriteUrl(filename) {
		var regex = /url\(['"](.*?)['"]\)/g;
		var basepath = filename.replace(bowerLoc, destAssets).split('/');
			basepath.pop();
			basepath = basepath.join('/');

		return function(data, cb) {
			var str = data.toString();
			var result = str.replace(regex, function() {
				var srcUrl = arguments[1];
				var targetURL = BASEPATH + basepath + '/' + srcUrl;

				return 'url("'+targetURL+'")';
			});
			cb(null, result);
		};
	}

	//Return a middleware function, which provides js and css bundles under their respective paths.
	//In addition, it provides other assets under their own path, if available.
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
			if(this.path.substr(0, destAssets.length) === destAssets && files.indexOf(asset) !== -1) {
				var pth = path.join(process.cwd(), asset);
				yield send(this, pth);
			} else {
				yield next;
			}
		}
	};
};

//Find the location, of the directory, where bower stores its components
function bowerLocation() {
	try {
		return JSON.parse(fs.readFileSync('.bowerrc', 'utf8')).directory;
	} catch(e) {
		return 'bower_components';
	}
}