var passport = require('koa-passport');

module.exports = function(redirect, login, logout) {
	return function *(next) {
		if(this.path === login && this.method === 'POST') {
			yield passport.authenticate('local', {
				successRedirect: redirect,
				failureRedirect: login + '#fail'
			}).call(this, next);
		} else if(this.path === logout) {
			this.logout();
			this.redirect(redirect);
		} else {
			yield next;
		}
	};
};