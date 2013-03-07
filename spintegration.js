exports = module.exports = function (operation, options){
	var arroptions = [];
	for (var key in options){
		arroptions.push('<tr><td><b>'+key+'</b></td><td>'+options[key].toString()+'</td></tr>');
	}
	var optionsString = '<table>'+arroptions.join('')+'</table>';
	
	var task = require('./static/objects/task.js');
	var test = new task.Task(1,2,3,4,5,6,7);
	console.log(test);

	var response = options.response;
	response.send('<h1>Operation: </h1>'+operation+'<h1>Options: </h1>'+optionsString);
};