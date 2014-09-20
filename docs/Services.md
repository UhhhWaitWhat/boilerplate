Services
========
Services are parts of your code which need to be instantiated and are used in different places of your application. Therefore they will be automatically bound to a global `services` variable.

To allow for easier testing later on, you should define your services so that they export a single function. This function will be executed and its return value will be bound to the `services` variable. I would advise you to return Promises in case of asynchronous operations.

An example of a service is our ORM, which can be found in `services/orm.js` and is documented seperately.