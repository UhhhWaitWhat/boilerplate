var marked = require('marked');
var hbs = require('handlebars');
var highlight = require('highlight.js');

marked.setOptions({
	highlight: function(code) {
		return highlight.highlightAuto(code).value;
	}
});

module.exports = function(context) {
	var arr = context.fn(context.data.root).split('\n');
	var moved = /^([ \t]*)/.exec(arr[0])[1].length;
	arr[0] = arr[0].substr(moved);

	return new hbs.SafeString(marked(arr.join('\n')));
};