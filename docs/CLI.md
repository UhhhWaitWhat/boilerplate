CLI
===
The main application file `index.js` provides two command line actions, `start` and `add`.
The first one starts the server, the second one asks for a username and a password to add a new user.

You have to use the `--harmony` option to the node executable, to enable generators for `koa`.
As the logger used is bunyan, you might want to pipe the start command into bunyan's executable to get nicer log output.

Also, to put the app into production mode you may want to set the `NODE_ENV` environment variable to `production`.
After all a full server start in production mode, with logging output on the command line might look like this:

	NODE_ENV='production' node --harmony index.js start | bunyan

To make this a little simpler, `node --harmony index.js start | bunyan` can be called as `npm start`.