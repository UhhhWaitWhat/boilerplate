var Promise = require('bluebird');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var request = require('superagent');
var page = require('page');
var hbs = require('handlebars');
var ptr = require('path-to-regexp');
var layout = require('./layout');
var diff = require('./diff');

function View(url) {
	EventEmitter.call(this);
	this.data = {};
	this.url = url;
	this.regex = ptr(url);
	this.handlers = {};
	this._template = this.fetchTemplate();
	this._transitions = [];
}

util.inherits(View, EventEmitter);

View.prototype.diff = function(oldBody, newBody) {
	/* We get messed up by empty class attributes, so remove them */
	Array.prototype.slice.call(oldBody.querySelectorAll('[class=""]')).forEach(function(el) {
		el.removeAttribute('class');
	});

	/* Run our diffing algorithm */
	diff(oldBody, newBody);
};

View.prototype._transition = function(oldBody, newBody, from) {
	var transition;
	for(var x = 0; x<this._transitions.length; x++) {
		transition = this._transitions[x];
		if(transition.regex.test(from)) {
			return transition.fn(oldBody, newBody);
		}
	}

	return this.diff(oldBody, newBody);
};

View.prototype.transition = function(from, fn) {
	this._transitions.push({
		regex: ptr(from),
		fn: fn.bind(this)
	});
};

View.prototype.render = function(from) {
	var self = this;
	return layout.then(function(layout) {
		var body = document.createElement('body');

		self.data.layout.body = self.template(self.data);
		body.innerHTML = layout(self.data.layout);
		return this._transition(document.body, body, from);
	});
};

View.prototype.load = function(path, from) {
	var self = this;
	return Promise.join(this._template, this.fetchData(path)).then(function() {
		self.emit('load');
		self.render(from);
		self.emit('loaded');
	}).catch(function(err) {
		if(err && typeof err.redirect === 'string') {
			page.replace(err.redirect);
		} else {
			throw err;
		}
	});
};

View.prototype.attach = function(type, selector, handler) {
	this.handlers[type] = this.handlers[type] || [];
	this.handlers[type].push({
		selector: selector,
		handler: handler
	});
};

View.prototype.handler = function(type, event) {
	this.handlers[type].forEach(function(el) {
		if(event.target.matches(el.selector)) {
			el.handler.apply(event.target, event);
		}
	});
};

View.prototype.fetchTemplate = function() {
	var self = this;
	return new Promise(function(resolve, reject) {
		request
			.get(self.url)
			.query({format: 't'})
			.end(function(err, res) {
				if(err) return reject(err);
				if(!res.ok) return reject(res);
				if(!self.regex.test(res.headers['request-path'])) {
					reject({redirect: res.headers['request-path']});
				} else {
					resolve(res.body.template);
				}
			});
	}).then(function(template) {
		self.template = hbs.compile(template); 
	});
};

View.prototype.fetchData = function(path) {
	var self = this;
	return new Promise(function(resolve, reject) {
		request
			.get(path)
			.query({format: 'd'})
			.end(function(err, res) {
				if(err) return reject(err);
				if(!res.ok) return reject(res);
				if(res.headers['request-path'] !== path) {
					self.redirected = true;
					reject({redirect: res.headers['request-path']});
				} else {
					resolve(res.body);
				}
			});
	}).then(function(data) {
		self.data = data.data || {};
		self.data.layout = data.layoutData || {};
	});
};

module.exports = View;