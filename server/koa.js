//Create a local logger instance
logger.koa = global.logger.child({module: 'koa'});

//Set up our koa instance and define our name and application keys
var app = require('koa')();
app.keys = config.session.keys;
app.name = NAME;
app.env = DEV ? 'development' : 'production';

//Bind all our middleware to our application
app.use(require('../middleware/basepath'));
app.use(require('koa-bunyan')(logger.koa));
app.use(require('koa-error')());
app.use(require('koa-gzip')());
app.use(require('koa-favicon')('./assets/favicon.png'));
app.use(require('koa-json')());
app.use(require('../middleware/js')('./assets/js/index.js', '/js', true));
app.use(require('../middleware/css')('./assets/sass/index.scss', '/css'));
app.use(require('../middleware/view')('views', '/js/helpers', '/js/views'));
app.use(require('../middleware/bower')('/js/deps', '/css/deps', '/deps'));
app.use(require('koa-static')('./assets/static'));
app.use(require('koa-polyfills')({path: '/js/deps/polyfills'}));
app.use(require('koa-body-parser')());
app.use(require('koa-generic-session')({store: new require('koa-redis')(config.session.redis)}));
app.use(services.passport.initialize());
app.use(services.passport.session());

//Bind our routes to our app
require('./routes')(app);

//Pipe our errors into bunyan as well
app.on('error', logger.koa.error.bind(logger));

//Start our app
app.listen(PORT);
logger.koa.info('Started server', {port: PORT});