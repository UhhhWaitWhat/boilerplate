var page = require('page');
var View = require('./view');
var util = require('util');
var DetachedEventHandler = require('./detachedevents');

//Our constructor
function Page() {
	DetachedEventHandler.call(this);
	this.attached = [];
	this.cache = {};
}

util.inherits(Page, DetachedEventHandler);

//Attach a view to its route
Page.prototype.attach = function(view, requesturl) {
	if(typeof view === 'string' || view instanceof RegExp) view = new View(view, requesturl);
	page(view.url, this._loadWrap(view));
};

//Bind a catch-all route to `page.js` which generates new views on-the-fly. Then start `page.js`.
Page.prototype.init = function() {
	var self = this;
	page('*', function (ctx) {
		self.ctx = ctx;
		self.cache[ctx.pathname] = self.cache[ctx.pathname] || new View(ctx.pathname.substring(BASEPATH.length));
		self._loadWrap(self.cache[ctx.pathname])(ctx);
	});
	page();
};

//Rerender the view without reloading
Page.prototype.render = function() {
	if(this.current) {
		this._removeListeners();
		this.current.render().then(function() {
			this._attachListeners();
		});
	}
};

//Reload the view
Page.prototype.reload = function() {
	if(this.current) {
		this._loadWrap(this.current)(this.ctx);
	}
};

//Load a specific view and attach all the corresponding listeners. Also emit the `open`/`opened` events.
Page.prototype._loadWrap = function(view) {
	var self = this;
	return function(ctx) {
		self.current = view;
		self._removeListeners();
		view.emit('open');
		view.load(ctx.pathname).then(function() {
			self._attachListeners();
			view.emit('opened');
		});
	};
};

//Attach all listeners from our current view as well as our own
Page.prototype._attachListeners = function() {
	var type;
	for(type in this.current.handlers) {
		this.attached.push({type: type, fn: this.current.handler.bind(this.current, type)});
		document.body.addEventListener(type, this.attached[this.attached.length-1].fn);
	}

	for(type in this.handlers) {
		this.attached.push({type: type, fn: this.handler.bind(this, type)});
		document.body.addEventListener(type, this.attached[this.attached.length-1].fn);
	}
};

//Remove all listeners
Page.prototype._removeListeners = function() {
	this.attached.forEach(function(el) {
		document.body.removeEventListener(el.type, el.fn);
	});

	this.attached = [];
};

//Export our Constructor
module.exports = Page;