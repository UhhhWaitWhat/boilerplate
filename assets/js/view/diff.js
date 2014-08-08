var l = require('./levenshtein');

function transition(current, next) {
	if(current.isEqualNode(next)) return;
	
	if(isBlock(current)) {
		replace(current, next);
		return true;
	} else {
		var cChildren = Array.prototype.slice.call(current.children);
		var nChildren = Array.prototype.slice.call(next.children);
		var cText = Array.prototype.slice.call(current.childNodes).filter(function(el) {return el.nodeType === 3;});
		var nText = Array.prototype.slice.call(next.childNodes).filter(function(el) {return el.nodeType === 3;});

		var tMatrix = l.matrix(nText, cText, function(a, b){return a.textContent === b.textContent;});
		var cMatrix = l.matrix(nChildren, cChildren, isSame);
		
		if(cChildren.length > 0 && nChildren.length > 0) {
			if(l.distance(cMatrix) > cChildren.length/2) {
				replace(current, next);
			} else {
				applyDiff(l.diff(cMatrix, nChildren), cChildren, current);
			}
		} else {
			if(l.distance(tMatrix) > cText.length/2) {
				replace(current, next);
			} else {
				applyTDiff(l.diff(tMatrix, nText), cText, current);
			}
		}
	}
}

function isSame(a, b) {
	var trigger = true;
	if(a.children.length === 0 && b.children.length === 0) {
		trigger = a.innerHTML === b.innerHTML;
	}

	return a.nodeType === b.nodeType &&
		a.id === b.id &&
		classEqual(a, b) &&
		attrEqual(a, b) &&
		trigger;
}

function isBlock(a) {
	return a.hasAttribute('diff-block');
}

function classEqual(a, b) {
	if(a.classList.length !== b.classList.length) return false;
	for(var x = 0; x < a.classList.length; x++) {
		if(!b.classList.contains(a.classList[x])) return false;
	}
	return true;
}

function attrEqual(a, b) {
	if(a.attributes.length !== b.attributes.length) return false;
	for(var x = 0; x < a.attributes.length; x++) {
		if(a.attributes[x].name === 'class') continue;
		if(a.attributes[x].value !== b.getAttribute(a.attributes[x].name)) return false;
	}
	return true;
}

function applyTDiff(diff, source, parent) {
	for(var x = 0; x < diff.length; x++) {
		switch(diff[x].type) {
			case ':':
				parent.replaceChild(diff[x].value, source[diff[x].position]);
				break;
			case '+':
				if(source[diff[x].position]) {
					parent.insertBefore(diff[x].value, source[diff[x].position]);
				} else {
					parent.appendChild(diff[x].value);
				}

				break;
			case '-':
				parent.removeChild(source[diff[x].position]);
				break;
		}
	}
}

function applyDiff(diff, source, parent) {
	function insert(el) {
		if(source[diff[x].position]) {
			parent.insertBefore(el, source[diff[x].position]);
		} else {
			parent.appendChild(el);
		}
	}

	for(var x = 0; x < diff.length; x++) {
		switch(diff[x].type) {
			case ':':
				replace(source[diff[x].position], diff[x].value);
				break;
			case '+':
				add(diff[x].value, insert);
				break;
			case '-':
				remove(source[diff[x].position]);
				break;
			case '=':
				transition(source[diff[x].position], diff[x].value);
				break;
		}
	}
}

function add(el, inject) {
	enter(el, function() {
		inject(el);
	});
}

function remove(el) {
	exit(el, function() {
		el.parentNode.removeChild(el);
	});
}

function replace(old, next) {
	exit(old, function() {
		enter(next, function() {
			old.parentNode.replaceChild(next, old);
		});
	});
}

function hasTransition(el) {
	var style = getComputedStyle(el);
	return typeof style.transition === 'string' && style['transitionProperty'] !== 'none';
}

function enter(el, action, cb) {
	el.classList.add('out');
	action();
	
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

function exit(el, cb) {
	el.classList.add('out');

	function listener() {
		el.removeEventListener('transitionend', listener);
		cb();
	}

	if(hasTransition(el)) {
		el.addEventListener('transitionend', listener);
	} else {
		cb();
	}
}

module.exports = transition;