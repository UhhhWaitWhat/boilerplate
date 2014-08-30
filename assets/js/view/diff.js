var async = require('async');
var Promise = require('bluebird');
var levenshtein = require('./levenshtein');
var isEqual = require('./equal');

function transition(from, to, cb) {
	if(isEqual(from, to)) return cb();

	if(from.children.length === 0 && to.children.length === 0) {
		if(from.innerHTML !== to.innerHTML) {
			replace(from, to, cb);
		} else {
			equaliseAttributes(from, to);
			cb();
		}
	} else {
		var childrenFrom = Array.prototype.slice.call(from.children);
		var childrenTo = Array.prototype.slice.call(to.children);
		var matrix = levenshtein.matrix(childrenFrom, childrenTo, isSame);
		
		if(!worthy(from, to, matrix)) {
			replace(from, to, cb);
		} else {
			equaliseAttributes(from, to);
			diffChildren(childrenFrom, childrenTo, matrix, from, cb);
		}
	}
}

function worthy(from, to, matrix) {
	return levenshtein.distance(matrix) < from.children.length/2;
}

function equaliseAttributes(from, to) {
	var src = Array.prototype.slice.call(from.attributes);
	var dest = Array.prototype.slice.call(to.attributes);
	
	for(var x = 0; x < src.length; x++) {
		if(!to.hasAttribute(src[x].name)) {
			from.removeAttribute(src[x].name);
		}
	}

	for(var y = 0; y < dest.length; y++) {
		if(dest[y].value !== from.getAttribute(dest[y].name)) {
			from.setAttribute(dest[y].name, dest[y].value);
		}
	}
}

function diffChildren(childrenFrom, childrenTo, matrix, parent, cb) {
	var differences = levenshtein.diff(matrix, childrenTo);

	async.map(differences, function(difference, cb) {
		var from = childrenFrom[difference.position];
		var to = difference.value;

		if(difference.type === ':') {
			replace(from, to, cb);
		} else if(difference.type === '+') {
			insert(to, parent, difference.position);
		} else if(difference.type === '-') {
			remove(from, cb);
		} else if(difference.type === '=') {
			transition(from, to, cb);
		}
	}, cb);
}

function isSame(a, b) {
	return a.nodeName === b.nodeName &&
			a.id === b.id &&
			a.getAttribute('diff-id') === b.getAttribute('diff-id');
}

function replace(from, to, cb) {
	var position = siblingCount(from);
	var parent = from.parentNode;

	remove(from, function() {
		insert(to, parent, position, cb);
	});
}

function insert(el, parent, position, cb) {
	el.classList.add('out');
	parent.insertBefore(el, parent.children[position]);

	setTimeout(function() {
		el.classList.add('in');
		el.classList.remove('out');

		function listener() {
			el.removeEventListener('transitionend', listener);
			el.classList.remove('in');
			if(cb) cb();
		}

		if(hasTransition(el)) {
			el.addEventListener('transitionend', listener);
		} else {
			el.classList.remove('in');
			if(cb) cb();
		}
	}, 0);
}

function remove(el, cb) {
	el.classList.add('out');

	function listener() {
		el.removeEventListener('transitionend', listener);
		el.parentNode.removeChild(el);
		cb();
	}

	if(hasTransition(el)) {
		el.addEventListener('transitionend', listener);
	} else {
		el.parentNode.removeChild(el);
		cb();
	}
}

function hasTransition(el) {
	var style = getComputedStyle(el);
	return typeof style.transition === 'string' && style.transitionProperty !== 'none';
}

function siblingCount(el) {
	var i = 0;
	while((el = el.previousSibling)	!== null) i++;
	return i;
}

module.exports = Promise.promisify(transition);