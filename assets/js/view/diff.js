var async = require('async');
var bluebird = require('bluebird');
var levenshtein = require('./levenshtein');
var isEqual = require('./equal');

//Transitions one element to another
function transition(from, to, cb) {
	if(isEqual(from, to)) return cb();

	if(from.children.length === 0 || to.children.length === 0) {
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

//Determine if it is worth to diff the element or if we should replace it completely.
function worthy(from, to, matrix) {
	return levenshtein.distance(matrix) < from.children.length/2;
}

//Transition the source element to a state of attribute equality with the target element by adding all neccessary attributes.
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

//Run a diffing algorithm over a group of child elements.
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

//Determine if two elements are `same`. For the differentiation between `same` and `equal` check the handwritten documentation.
function isSame(a, b) {
	return a.nodeName === b.nodeName &&
			a.id === b.id &&
			a.getAttribute('diff-id') === b.getAttribute('diff-id');
}

//Replace an element with another.
function replace(from, to, cb) {
	var position = siblingCount(from);
	var parent = from.parentNode;

	remove(from, function() {
		insert(to, parent, position, cb);
	});
}

//Insert an element into parent at a given position.
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

//Remove an element from the dom.
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

//Check if a given element has the `transition` property and if we have to wait for a transition to finish.
function hasTransition(el) {
	var style = getComputedStyle(el);
	return typeof style.transition === 'string' && style.transitionProperty !== 'none';
}

//Determine the position of an element within its parent element.
function siblingCount(el) {
	var i = 0;
	while((el = el.previousSibling)	!== null) if(el.nodeType === 1) i++;
	return i;
}

module.exports = bluebird.promisify(transition);