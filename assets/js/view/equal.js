function isEqual(a, b) {
	return a.nodeName === b.nodeName &&
			textEqual(a, b) &&
			classEqual(a, b) &&
			attrEqual(a, b) &&
			childEqual(a, b);
}

function textEqual(a, b) {
	if(a.children.length === 0 && b.children.length === 0) {
		return a.textContent === b.textContent;
	}

	return true;
}

function classEqual(a, b) {
	if(a.classList.length !== b.classList.length) return false;

	for(var x = 0; x < a.classList.length; x++) {
		if(!b.classList.contains(a.classList[x])) return false;
	}

	return true;
}

function childEqual(a, b) {
	if(a.children.length !== b.children.length) return false;

	for(var x = 0; x < a.children.length; x++) {
		if(!isEqual(a.children[x], b.children[x])) return false;
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

module.exports = isEqual;