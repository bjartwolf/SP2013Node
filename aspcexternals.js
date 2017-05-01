exports = module.exports = function (app) {
	try{
		var aspc = require('./aspc/app.js');
		app.use(aspc);
	}
	catch (e)
	{
		console.log(e);		
	}	
}