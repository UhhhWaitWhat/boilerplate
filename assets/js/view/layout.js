var request = require('superagent');
var hbs = require('handlebars');

//Export a promise representing our applications layout.
module.exports = new Promise(function(resolve, reject) {
	request
		.get(BASEPATH+'/')
		.query({format: 'l'})
		.end(function(err, res) {
			if(err) return reject(err);
			if(!res.ok) return reject(res);
			resolve(res.body.layout);
		});
}).then(function(template) {
	return hbs.compile(template); 
});