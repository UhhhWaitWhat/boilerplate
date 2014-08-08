Services
========
Services are parts of your code which are needed in a lot of places all over your application. Therefore they will be automatically bound to a global `services` variable.

Services are defined in the `services` folder and are automatically loaded upon start of your application. In case they load asynchronously, I would advise you to export promises from your service files.

An example of a service is our ORM, which can be found in `services/orm.js` and is documented seperately.