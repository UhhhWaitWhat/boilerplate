var hbs = require('handlebars');
var highlight = require('highlight.js');

//Highlight everything as javascript
module.exports = function(data) {
	return new hbs.SafeString(highlight.highlight('javascript', data).value);
};