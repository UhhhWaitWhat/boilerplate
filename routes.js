var R = require('koa-route');

function view(name) {
	return function* () {
		yield this.view.call(this, name, Array.prototype.slice.call(arguments));
	};
}

module.exports = function(app) {
	/* Views */
	app.use(R.get('/', view('home')));
	app.use(R.get('/docs/:doc?', view('docs')));
	app.use(R.get('/login', view('login')));
};