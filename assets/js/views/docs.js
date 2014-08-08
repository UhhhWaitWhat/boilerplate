var View = require('../view/view.js');
var view = new View('/docs');

view.attach('click', '.doc', function() {
	var name = this.getAttribute('doc-id');
	view.data.docs.forEach(function(el) {
		if(el.name === name) {
			el.selected = true;
			view.data.selected = el;
		} else {
			el.selected = false;
		}
	});
	view.render();
});

module.exports = view;