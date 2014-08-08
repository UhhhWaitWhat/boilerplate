Middleware
==========
Our server is started with some basic koa middleware, which is listed below with each middlewares configuration. In addition some handwritten middleware is used, which resides in the `middleware` folder. It helps with asset serving as well as our view rendering and information about it can be found in the `Views` and `Assets` documentation.

Basic Middleware
----------------
* koa-bunyan
	* Ties koa to our bunyan logger and sets `module` to `koa`
* koa-error
* koa-gzip
* koa-favicon
	* Serves `assets/favicon.png`
* koa-json
* koa-static
	* Serves `assets/static`
* koa-polyfills
* koa-body-parser
* koa-generic-session
	* Ties into a redis session configured via `config/session.json`
* koa-passport
	* Provides authentication using the `User` model and basic username/password validation (check the `Passport` documentation)