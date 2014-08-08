var page = require('page');
var View = require('./view');
var handlers = [];
var cache = {};

function attach(view) {
	page(view.url, loadView(view));
}

function init() {
	page('*', function (ctx) {
		cache[ctx.pathname] = cache[ctx.pathname] || new View(ctx.pathname);
		loadView(cache[ctx.pathname])();
	});
	page();
}

function loadView(view) {
	return function() {
		removeListeners();
		view.emit('open');
		view.load().then(function() {
			for(var type in view.handlers) {
				handlers.push({type: type, fn: view.handler.bind(view, type)});
				document.body.addEventListener(type, handlers[handlers.length-1].fn);
			}
			view.emit('opened');
		});
	}
}

function removeListeners() {
	handlers.forEach(function(el) {
		document.body.removeEventListener(el.type, el.fn);
	});

	handlers = [];
}

module.exports = {
	attach: attach,
	init: init
}