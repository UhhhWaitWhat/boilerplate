[![Build Status](https://img.shields.io/travis/PaulAvery/boilerplate.svg?style=flat)](https://travis-ci.org/PaulAvery/boilerplate)

A Webapp Boilerplate
====================
After several attempts at using different Web Application frameworks, I decided to give writing my own one a shot. It solves some of the problems I had with other frameworks and is tailored to my specific needs, but I hope it might prove useful to some other people as well.

All the code to implement its features (with the exception of 3rd party dependencies of course) is present in this repository. The idea behind this is, to provide transparency in regards to what does what and also to make it easily changeable to fit different requirements.

This also means, that everything written in the docs are merely suggestions and explanations of how the current code works. It should in no way prevent you from ripping out the routing system and replacing it with something more complex/feature-rich for example.

Features
--------
* Based on [Koa](http://koajs.com/)
* Client-/Server-side view rendering via [Handlebars](http://handlebarsjs.com/)
	* View Diffing for minimal updates upon changes. Supports css transitions
* Integrated [Waterline](https://github.com/balderdashy/waterline) ORM
* Dynamic asset compiling and serving
* Integrated [Bunyan](https://github.com/trentm/node-bunyan) logger
* [Passport](http://passportjs.org/) integration already set up
* [Redis](http://redis.io/) session store
* Self documenting using [docco](http://jashkenas.github.io/docco/) in addition to markdown documentation
* Existing configuration for [jshint](http://www.jshint.com/), [Travis CI](https://travis-ci.org/), [bower](http://bower.io/) and [pm2](https://github.com/Unitech/pm2)

Getting started
---------------
This repository contains a full boilerplate application (except for all dependencies of course). To get started simply clone this repository, and install any dependencies:

	$ git clone https://github.com/PaulAvery/boilerplate.git
	$ npm install && bower install

Now you should set up your redis store in `config/session.json` and add some encryption keys into the `keys` array as well. Once you're done, you can add a user and start your application:

	$ npm run-script add
	$ npm start

Considerations
--------------
You will need a node version `>= 0.11` due to the fact that koa depends on the availability of generators.

The included bcrypt module is `bcrypt-nodejs` which is a slower (because fully implemented in JavaScript) version of `bcrypt`. The reason for this is, that `bcrypt` is currently not compatible with node development versions.

For further documentation check the `docs` folder.