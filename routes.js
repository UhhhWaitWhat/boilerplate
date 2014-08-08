var R = require('koa-route');

function view(name) {
	return function* () {
		yield this.view(name);
	};
}

module.exports = function(app) {
	/* Views */
	app.use(R.get('/', view('home')));
	app.use(R.get('/docs', view('docs')));
	app.use(R.get('/login', view('login')));
};