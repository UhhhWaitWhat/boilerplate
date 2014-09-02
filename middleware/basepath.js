module.exports = function *(next) {
	//Save full path
	this.originalpath = this.path;

	//Monkeypatch redirect to prefix if absolute.
	var redirect = this.redirect;
	this.redirect = function(path, alt) {
		path = path[0] === '/' ? BASEPATH + path : path;
		redirect.call(this, path, alt);
	};

	//Throw 404 if basepath not there. Otherwise override `this.path`.
	if(this.path.substring(0, BASEPATH.length+1) !== BASEPATH+'/') {
		this.status = 404;
		this.body = 'Not Found! Request does not start with "'+BASEPATH+'/"';
	} else {
		this.path = this.path.substring(BASEPATH.length);
		yield next;
	}
};