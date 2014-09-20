var EventEmitter = require('events').EventEmitter;
var util = require('util');

function DetachedEventHandler() {
	EventEmitter.call(this);
	this.handlers = {};
}

//We should be an eventemitter as well
util.inherits(DetachedEventHandler, EventEmitter);

//Assign our handlers to ourselves. These should be grouped by type
DetachedEventHandler.prototype.onDetached = function(type, selector, handler, bubbling) {
	if(bubbling !== false) bubbling = true;
	this.handlers[type] = this.handlers[type] || [];

	this.handlers[type].push({
		selector: selector,
		handler: handler,
		bubbling: bubbling
	});	
};

//Runs all handlers for a given type if the event matches
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