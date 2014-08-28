ORM
===
Your new application comes with a preconfigured ORM named [Waterline]().
Waterline is a 3rd-party product, so you should read their docs in regards to how it works, which can be found at https://github.com/balderdashy/waterline-docs.

Adapter Config
--------------
The adapter to be used can be configured in config.orm. You should have the specified adapter installed and if needed any options should be defined here as well.

Model Loading
-------------
Models are loaded from the `models` folder. They will have their adapter set to your configured one and will be named after your Filenames. Each file should export one model object and if you use associations, you should remember that internally the model names are lowercased.

Using the ORM
-------------
The orm is, like all services, assigned to the global `services` variable. It is provided as a promise, so you don't have to care if it is instantiated yet, so in a koa middleware something like this works:

	var orm = yield services.orm;

`orm` is now an object with all loaded Collection objects attached to it. You may query it for any models and as the queries return promises, you may yield them like this:

	var user = yield orm.User.findOne(0);

I hope you find this as useful as I do.