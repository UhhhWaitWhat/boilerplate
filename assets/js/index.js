//Require our router so we can use it later
var page = require('./view/page');

//Attach our views.
//We only need to attach views with parameterized routes, the other ones are caught and created at runtime
page.attach('/docs/written/:doc');
page.attach(/^\/docs\/generated(\/.*){0,1}/, '/docs/generated');

//Run our router
page.init();