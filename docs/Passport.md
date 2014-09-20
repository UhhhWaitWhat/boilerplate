Passport
========
This application comes with a preconfigured version of passport. It uses the session provided by `koa-generic-session` in combination with `koa-redis`.

It is by default configured for basic authentication on the routes `POST /login` and `/logout` and uses the `User` ORM model, to validate users. The configuration of the strategy can be found in `services/passport.js`, while the routes may be changed in `server/routes.js`.