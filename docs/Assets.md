Assets
======
Our custom middleware does its best to simplify asset serving for you. In addition to the contents of the `assets/static` folder, which are served by `koa-static` under the web root, [bower](http://bower.io/) packages, CSS and SASS files as well as CommonJS modules will be compiled and served automatically.

Bower
=====
Bower modules are installed to `assets/bower` and all their main files are compiled and served under `/js/deps` and `/css/deps` respectively. Note that these paths are the complete paths to the bundles. Any other bower-assets are served under `/deps` (fonts, images etc.).

CSS/SCSS/SASS
=============
In the folder 'assets/sass' you will find a file `index.scss`. This file will be run through the sass executable, therefore resolving all imports and generating one css file served under `/css`. This css file will be run through [autoprefixer](https://github.com/ai/autoprefixer), so you do not have to care about browser prefixes.

CommonJS
========
Similarly to the SASS index file, you will find an `assets/js/index.js` file. This file will be run through [browserify](http://browserify.org/) and served as `/js`.

Polyfills
=========
In addition to all of this, we also provide JavaScript Polyfills via `koa-polyfills`. These can be included by loading `/js/deps/polyfills`. Obviously, they should be included before anything else.