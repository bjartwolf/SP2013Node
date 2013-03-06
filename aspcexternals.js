exports = module.exports = function (app) {
	var aspc = require('./aspc/app.js');
	console.log(aspc);
	app.use(aspc);
}