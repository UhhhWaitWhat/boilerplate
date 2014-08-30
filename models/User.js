var bcrypt = require('bcrypt-nodejs');

//Our basic model, as used by [Waterline](https://github.com/balderdashy/waterline)
module.exports = {
	attributes: {
		name: {
			type: 'string',
			required: true
		},
		password: {
			type: 'string',
			required: true,
			minLength: 8
		},
		valid: function (password, cb) {
			var self = this;
			bcrypt.compare(password, this.password, function(err, same) {
				if(err) return cb(err);
				cb(null, same ? self : false);
			});
		},
		toJSON: function() {
			var obj = this.toObject();
			delete obj.password;
			return obj;
		}
	},
	beforeCreate: hashPassword,
	beforeUpdate: hashPassword
};

//Before saving the password to the database, hash it via use of `bcrypt`
//This is important, so **DO NOT REMOVE OR SKIP THIS STEP EVER**
function hashPassword(values, next) {
	bcrypt.hash(values.password, bcrypt.genSaltSync(10), null, function(err, hash) {
		if(err) return next(err);
		values.password = hash;
		next();
	});
}