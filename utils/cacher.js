//Cacher for a single entity
function Cacher(fn, mod) {
	this._fn = fn;
	this._mod = mod;
}

//Get the data and reload if needed
Cacher.prototype.get = function *() {
	if(!this._cache) return yield this._load();
	if(DEV && (yield this._mod()) > this._time) {
		return yield this._load();
	}
	return this._cache;
};

//Reload the data
Cacher.prototype._load = function *() {
	this._cache = yield this._fn(this._cache);
	this._time = yield this._mod();

	return this._cache;
};

//Cacher for multiple entities
Cacher.Multi = function MultiCacher(fn, mod) {
	this._cache = {};
	this._fn = fn;
	this._mod = mod;
};

//Get the data for a specific id
Cacher.Multi.prototype.get = function *(id) {
	if(!this._cache[id]) {
		this._cache[id] = new Cacher(
			this._fn.bind(this, id),
			this._mod.bind(this, id)
		);
	}

	return yield this._cache[id].get();
};

module.exports = Cacher;