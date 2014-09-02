var passport = require('koa-passport');
var LocalStrategy = require('passport-local').Strategy;

//Implement serialization and deserialization for our ORM
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	services.orm.then(function(ORM) {
		return ORM.User.findOne(id);
	}).then(function(user) {
		done(null, user);
	}).catch(done);
});

//Set a default local strategy which will be used by our application
passport.use(new LocalStrategy(function(username, password, done) {
	services.orm.then(function(ORM) {
		return ORM.User.findOne({name: username});
	}).then(function(user) {
		if(user) {
			user.valid(password, done);
		} else {
			done(null, false);
		}
	}).catch(done);
}));

//Export our custom middleware
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