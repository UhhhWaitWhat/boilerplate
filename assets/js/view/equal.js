//Determine if two elements are `equal`. For the differentiation between `same` and `equal` check the handwritten documentation.
function isEqual(a, b) {
	return a.nodeName === b.nodeName &&
			textEqual(a, b) &&
			classEqual(a, b) &&
			attrEqual(a, b) &&
			childEqual(a, b);
}

//Determine if two elements are textually equal.
//This automatically assumes elements with at least one child element to contain no text nodes.
function textEqual(a, b) {
	if(a.children.length === 0 && b.children.length === 0) {
		return a.textContent === b.textContent;
	}

	return true;
}

//Determine if two elements have exactly the same classes
function classEqual(a, b) {
	if(a.classList.length !== b.classList.length) return false;

	for(var x = 0; x < a.classList.length; x++) {
		if(!b.classList.contains(a.classList[x])) return false;
	}

	return true;
}

//Determine if two elements have equal child elements (order is checked as well).
function childEqual(a, b) {
	if(a.children.length !== b.children.length) return false;

	for(var x = 0; x < a.children.length; x++) {
		if(!isEqual(a.children[x], b.children[x])) return false;
	}

	return true;
}

//Determine if two elements have identical attributes (with the exception of the `class` attribute).
function attrEqual(a, b) {
	if(a.attributes.length !== b.attributes.length) return false;
	
	for(var x = 0; x < a.attributes.length; x++) {
		if(a.attributes[x].name === 'class') continue;
		if(a.attributes[x].value !== b.getAttribute(a.attributes[x].name)) return false;
	}

	return true;
}

module.exports = isEqual;