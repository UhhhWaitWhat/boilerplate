Router
======
Our router is based on [page.js](https://github.com/visionmedia/page.js). Therefore it overrides links on your page and takes care of your client-side routing.

A router can be created like so:

	var Page = require('./view/page');
	var page = new Page();

The current view will always be attached as `page.current`. This is useful to modify data during global events, such as a variable that shows a menu e.g. So you could do:

	page.current.data.layout.menu = true
	page.render();

to show a global menu. This menu would go away the next time you load a view normally.

Instance-Methods
----------------
### attach(view, <url>)
Attaches a new view to our router. If `view` is not a view object, but a string or a RegExp, a view with this url is created on the fly. In this case the url parameter, if provided, is passed to the view constructor as its second parameter.

### init()
Starts our router, internally this starts the `page.js` library and attaches a catch-all route to create new views on-the-fly.

### render()
Rerenders the current view without reloading data from the server. This is useful if you want to manually manipulate the views data.

### reload()
Reloads the current view with new server-side data.

### onDetached(type, selector, handler, bubbling)
Works the same as on views, with the exception that these are not view dependent.