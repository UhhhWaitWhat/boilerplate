Routes
======
This application does not come with a fully fledged router like you would expect from an express application. Instead, it provides a `routes.js` file, in which you may define your routes with the help of `koa-route`. Therefore a route definition looks like this:

	var R = require('koa-route');
	app.use(R.get('/', yourRouteMiddleware));

To make view binding easier, we defined a small utility function at the top of the file, which allows for this:

	app.use(R.get('/', view('home')));

But after all, you can use whatever routing system you would like.