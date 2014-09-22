var hbs = require('handlebars');
var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));
var path = require('path');
var browserify = require('browserify');
var es = require('event-stream');
var _ = require('lodash');
var log = logger.child({module: 'views'});
var Cacher = require('../utils/cacher');

module.exports = function(pth, url) {
	assignHelpers(pth);
	var compiledHelpers = compileHelpers(pth);

	//Create our caches
	var cache = new Cacher.Multi(fetchTemplate.bind(null, pth), checkTemplate.bind(null, pth));
	var layoutCache = new Cacher(fetchLayout.bind(null, pth), checkLayout.bind(null, pth));

	//Render a specific view
	function* render(name, params) {
		var data;
		var self = this;
		var layout = yield layoutCache.get();
		var template = yield cache.get(name);
		log.info({view: name, format: this.request.query.format}, 'Rendering view');
		
		//Assign data based on the request type
		if(this.request.query.format) {
			var result = {};
			if(this.request.query.format.indexOf('d') !== -1) {
				data = yield getData();
				result.data = data.template;
				result.layoutData = data.layout;
			}

			if(this.request.query.format.indexOf('t') !== -1) {
				result.template = template.string;
			}
			this.body = result;
		} else {
			data = yield getData();
			//Attach either the data or a rendered view
			this.body = layout.frame({
				basepath: BASEPATH,
				body: layout.layout(_.merge({
					body: template.compiled(_.merge(data.template, {layout: data.layout}))
				}, data.layout))
			});
		}

		function *getData() {
			var data = {
				layout: yield layout.fn.apply(self),
				template: yield template.fn.apply(self, params)
			};
			data.layout.basepath = BASEPATH;

			return data;
		}
	}

	//Our middleware to attach a view
	return function* (next) {
		var redirect = this.redirect;
		//Monkeypatch redirect to preserve our format parameter
		this.redirect = function(path, alt) {
			redirect.call(this, path + (this.query.format ? '?format=' + this.query.format : ''), alt);
		};

		this.view = render;
		this.set('Request-Path', this.path);

		if(this.path === url) {
			this.body = yield compiledHelpers;
			this.type = 'text/javascript';
		} else if(this.path === '/' && this.query.format === 'l') {
			//Always send our layout if requested on our root path
			this.body = {layout: (yield layoutCache.get()).string};
		} else {
			yield next;
		}
	};
};

//Compile our handlebars helpers from a specific path and then run them through browserify
//Allows us to serve them to the client
function compileHelpers(pth) {
	return new Promise(function(resolve, reject) {
		var filenames = fs.readdirSync(path.join(pth, 'helpers'));
		
		var contents = filenames.reduce(function(sum, name) {
			return sum + 'hbs.registerHelper("'+name.split('.')[0]+'", require("./'+name+'"));\n';
		}, 'var hbs = require("handlebars");\n');

		var b = browserify(es.readArray([contents]), {basedir: path.join(process.cwd(), pth, 'helpers')});
		b.require('handlebars');
		b.bundle(function(err, src) {
			if(err) {
				log.warn(err, 'Failed to compile handlebars helpers');
				reject(err);
			} else {
				log.debug('Compiled helpers to be served to the client');
				resolve(src);
			}
		});
	});
}

//Register our handlebars helpers
function assignHelpers(pth) {
	var helpers = require('require-directory')(module, path.join('..', pth, 'helpers'));
	_.each(helpers, function(helper, name) {
		name = name.split('.')[0];
		if(!hbs.helpers[name]) {
			hbs.registerHelper(name, helper);
			log.debug({name: name}, 'Loaded helper');
		}
	});
}

//Load a template from disk, compile and return it
function *fetchTemplate(pth, name, prev) {
	var fn;
	log.debug({view: name}, 'Loading template.hbs from disk');

	if(prev && prev.fn) {
		fn = prev.fn;
	} else {
		try {
			fn = require(path.join(process.cwd(), pth, name, 'data.js'));
		} catch(e) {
			if(e.code !== 'MODULE_NOT_FOUND') {
				throw e;
			}
			fn = function *() {};
		}
	}

	var template = yield fs.readFileAsync(path.join(process.cwd(), pth, name, 'template.hbs'), 'utf8');
	return {
		fn: fn,
		string: template,
		compiled: hbs.compile(template)
	};
}

//Get the time for a template
function *checkTemplate(pth, name) {
	var stats = yield fs.lstatAsync(path.join(process.cwd(), pth, name, 'template.hbs'));
	return stats.mtime;		
}

//Load the layout from disk, 
function *fetchLayout(pth, prev) {
	var fn;
	
	if(prev && prev.fn) {
		fn = prev.fn;
	} else {
		try {
			fn = require(path.join(process.cwd(), pth, 'layout.js'));
			log.debug('layout.js loaded');
		} catch(e) {
			fn = function(cb) {cb();};
			log.debug('No layout.js file found');
		}
	}

	log.debug('Reloading layout.hbs from disk');
	log.debug('Reloading frame.hbs from disk');
	var layout = yield fs.readFileAsync(path.join(process.cwd(), pth, 'layout.hbs'), 'utf8');
	var frame = yield fs.readFileAsync(path.join(process.cwd(), pth, 'frame.hbs'), 'utf8');

	return {
		fn: fn,
		string: layout,
		layout: hbs.compile(layout),
		frame: hbs.compile(frame)
	};		
}

//Get the last modified time of the layout
function *checkLayout(pth) {
	var layout = fs.lstatAsync(path.join(process.cwd(), pth, 'layout.hbs'));
	var frame = fs.lstatAsync(path.join(process.cwd(), pth, 'frame.hbs'));

	return Math.max(layout.mtime, frame.mtime);
}
