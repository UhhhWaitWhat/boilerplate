Logging
=======
Your application comes preconfigured with a [bunyan]() logger assigned to a global `logger` variable. It outputs everything to stdout, so you can either direct the output to a log or directly to bunyan's executable.

Normally I would advise against using globals, but in the case of this application, which is not consumed by anything, I think the benefits of having a globally available logger outweigh the disadvantages of using globals.

Child Loggers
-------------
We use bunyans concept of child loggers to structure our logging output. If you have a module, service or middleware which should log something, you should instantiate a new child logger like this:

	var logger = global.logger.child({module: modulename});

`modulename` should be something unique to identify your module/service/middleware. For services which have subinstances, you may want to consider attaching your child logger to the global logger object so you do not have to pass it around. We do this for our ORM like this:

	logger.orm = logger.child({module: 'orm'});

And then use it for our models:

	var logger = global.logger.orm.child({model: 'User'});

Log Levels
----------
In development mode, we log everything up to `trace`. In production we log only up to `info`.