var hbs = require('handlebars');
var thunkify = require('thunkify');
var fs = require('fs');
var path = require('path');
var browserify = require('browserify');
var es = require('event-stream');
var _ = require('lodash');
var log = logger.child({module: 'views'});

module.exports = function(pth, url) {
	assignHelpers(pth);
	var compiledHelpers = compileHelpers(pth);
	var cache = {};
	var layoutCache = {};

	//Fetch a template for a specific name. If it changed, load it from disk again
	function* getTemplate(name) {
		cache[name] = cache[name] || {time: 0};

		//Load the data function if available
		if(!cache[name].fn) {
			try {
				cache[name].fn = require(path.join(process.cwd(), pth, name, 'data.js'));
			} catch(e) {
				if(e.code !== 'MODULE_NOT_FOUND') {
					throw e;
				}
				cache[name].fn = function *() {};
			}
		}

		//Check the timestamp if we need to reload the template
		var stats = yield thunkify(fs.lstat)(path.join(process.cwd(), pth, name, 'template.hbs'));
		if(new Date(stats.mtime) > new Date(cache[name].time)) {
			var template = yield thunkify(fs.readFile)(path.join(process.cwd(), pth, name, 'template.hbs'), 'utf8');
			cache[name].compiled = hbs.compile(template);
			cache[name].string = template;
			cache[name].time = stats.mtime;
		}

		return cache[name];
	}

	//Fetch the layout and load from disk if changed
	function* getLayout() {
		//Load the data function if available
		if(!layoutCache.fn) {
			try {
				layoutCache.fn = require(path.join(process.cwd(), pth, 'layout.js'));
			} catch(e) {
				layoutCache.fn = function(cb) {cb();};
			}
		}

		//Check for timestamps and update if needed
		var stats = {
			layout: yield thunkify(fs.lstat)(path.join(process.cwd(), pth, 'layout.hbs')),
			frame: yield thunkify(fs.lstat)(path.join(process.cwd(), pth, 'frame.hbs'))
		};

		//Compare the times
		layoutCache.times = layoutCache.times || {layout: 0, frame: 0};
		if(new Date(stats.layout.mtime) > new Date(layoutCache.times.layout)) {
			layoutCache.times.layout = stats.layout.mtime;
			layoutCache.string = yield thunkify(fs.readFile)(path.join(process.cwd(), pth, 'layout.hbs'), 'utf8');
			layoutCache.compiled = hbs.compile(layoutCache.string);
		}
		if(new Date(stats.frame.mtime) > new Date(layoutCache.times.frame)) {
			layoutCache.times.frame = stats.frame.mtime;
			layoutCache.frame = hbs.compile(yield thunkify(fs.readFile)(path.join(process.cwd(), pth, 'frame.hbs'), 'utf8'));
		}

		return layoutCache;
	}

	//Render a specific view
	function* render(name, params) {
		var data;
		var self = this;
		var layout = yield getLayout();
		var template = yield getTemplate(name);
		
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
				body: layout.compiled(_.merge({
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
			this.body = {layout: (yield getLayout()).string};
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
				reject(err);
			} else {
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
			log.info('Loaded helper "' + name + '"');
		}
	});
}