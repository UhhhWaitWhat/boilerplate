var hbs = require('handlebars');
var highlight = require('highlight.js');

//Export our helper function
module.exports = function(data) {
	return new hbs.SafeString(highlight.highlight('javascript', data).value);
};