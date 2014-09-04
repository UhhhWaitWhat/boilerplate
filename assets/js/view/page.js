var page = require('page');
var View = require('./view');
var handlers = [];
var cache = {};

//Attach a view to its route
function attach(view, requesturl) {
	if(typeof view === 'string' || view instanceof RegExp) view = new View(view, requesturl);
	page(view.url, loadView(view));
}

//Bind a catch-all route to `page.js` which generates new views on-the-fly. Then start `page.js`.
function init() {
	page('*', function (ctx) {
		cache[ctx.pathname] = cache[ctx.pathname] || new View(ctx.pathname.substring(BASEPATH.length));
		loadView(cache[ctx.pathname])(ctx);
	});
	page();
}

//Load a specific view and attach all the corresponding listeners. Also emit the `open`/`opened` events.
function loadView(view) {
	return function(ctx) {
		removeListeners();
		view.emit('open');
		view.load(ctx.pathname).then(function() {
			for(var type in view.handlers) {
				handlers.push({type: type, fn: view.handler.bind(view, type)});
				document.body.addEventListener(type, handlers[handlers.length-1].fn);
			}
			view.emit('opened');
		});
	};
}

//Remove all listeners
function removeListeners() {
	handlers.forEach(function(el) {
		document.body.removeEventListener(el.type, el.fn);
	});

	handlers = [];
}

//Export our public interface
module.exports = {
	attach: attach,
	init: init
};