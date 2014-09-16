var EventEmitter = require('events').EventEmitter;
var util = require('util');

function DetachedEventHandler() {
	EventEmitter.call(this);
	this.handlers = {};
}

util.inherits(DetachedEventHandler, EventEmitter);

DetachedEventHandler.prototype.onDetached = function(type, selector, handler, bubbling) {
	if(bubbling !== false) bubbling = true;
	this.handlers[type] = this.handlers[type] || [];

	this.handlers[type].push({
		selector: selector,
		handler: handler,
		bubbling: bubbling
	});	
};

DetachedEventHandler.prototype.handler = function(type, event) {
	this.handlers[type].forEach(function(el) {
		for(var x = 0; x < event.path.length; x++) {
			if(event.path[x].matches && event.path[x].matches(el.selector)) {
				el.handler.apply(event.path[x], event);
				return;
			}
			if(!el.bubbling) return;
		}
	});
};

module.exports = DetachedEventHandler;