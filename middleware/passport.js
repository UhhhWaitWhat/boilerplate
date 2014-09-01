var passport = require('koa-passport');

module.exports = function(redirect, login, logout) {
	return function *(next) {
		//Login if we have a post request to our login route
		if(this.path === login && this.method === 'POST') {
			yield passport.authenticate('local', {
				successRedirect: redirect,
				failureRedirect: login + '#fail'
			}).call(this, next);
		//Logout if we have any request to our logout route
		} else if(this.path === logout) {
			this.logout();
			this.redirect(redirect);
		//Continue normally otherwise
		} else {
			yield next;
		}
	};
};