module.exports = function *() {
	//Return our user, so we can show the login status in every view
	return {
		user: this.passport.user || false
	};
};