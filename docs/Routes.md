Routes
======
This application does not come with a fully fledged router like you would expect from an express application. Instead, it provides a `routes.js` file, in which you may define your routes with the help of `koa-route`. Therefore a route definition looks like this:

	var R = require('koa-route');
	app.use(R.get('/', yourRouteMiddleware));

To make view binding easier, we defined a small utility function at the top of the file, which allows for this:

	app.use(R.get('/', view('home')));

But after all, you can use whatever routing system you would like.

Basepath (e.g. running behind proxy)
------------------------------------
You can pass the application a base path as an environment variable like so:

	BASEPATH=/base npm start

You will not need to change your routes to acommodate this and absolute redirects are handled for you as well. You will have to keep this in mind however, when using absolute links. You have the `{{basepath}}` variable available in your layout as well as your frame (therefore you have `{{layout.basepath}}` in your views).
In addition you have the global `BASEPATH` variable to use on the client as well as the server. Your koa context also has a new property `originalpath` with the full request path, while `this.path` will contain the path without the prefix.