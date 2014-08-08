var _ = require('lodash');
var Promise = require('bluebird');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var request = require('superagent');
var page = require('page');
var hbs = require('handlebars');
var transition = require('./diff');
var layout = require('./layout');

function View(url) {
	EventEmitter.call(this);
	this.data = {};
	this.url = url;
	this._template = this.fetchTemplate();
	this.handlers = {};
}

util.inherits(View, EventEmitter);

View.prototype.render = function() {
	var self = this;
	return layout.then(function(layout) {
		var body = document.createElement('body');

		self.data.layout.body = self.template(self.data);
		body.innerHTML = layout(self.data.layout);
		/* We get messed up by empty class attributes, so remove them */
		Array.prototype.slice.call(document.body.querySelectorAll("[class='']")).forEach(function(el) {
			el.removeAttribute('class');
		});
		return transition(document.body, body);
	});
};

View.prototype.load = function() {
	var self = this;
	return Promise.join(this._template, this.fetchData()).then(function() {
		self.emit('load');
		self.render();
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
				if(res.headers['request-path'] !== self.url) {
					reject({redirect: res.headers['request-path']});
				} else {
					resolve(res.body.template);
				}
			});
	}).then(function(template) {
		self.template = hbs.compile(template); 
	});
};

View.prototype.fetchData = function() {
	var self = this;
	return new Promise(function(resolve, reject) {
		request
			.get(self.url)
			.query({format: 'd'})
			.end(function(err, res) {
				if(err) return reject(err);
				if(!res.ok) return reject(res);
				if(res.headers['request-path'] !== self.url) {
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