module.exports = function* () {
	if(this.isAuthenticated()) {
		this.redirect('/');
	} else {
		return;
	}
};