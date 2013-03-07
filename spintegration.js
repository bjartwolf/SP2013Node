exports = module.exports = function (operation, options){
	if (operation === "GetAll" && options.entitytype === "task") {
		var Task = require('./static/objects/task.js').Task;
		var tasks = [];
		tasks.push(new Task(1,'Sarah', 'fix #34','when user create ..','high',0.5,'15.12.2012'));
		tasks.push(new Task(2,'John', 'fix #35','The dashboard is missing ..','low',0.5,'15.12.2012'));
		tasks.push(new Task(3,'Rachel', 'fix #234','expand the bagdes','high',0.5,'15.12.2012'));
		tasks.push(new Task(4,'Maxim', 'enhancement #234','add a ui to..','low',0.5,'15.12.2012'));
		tasks.push(new Task(5,'Marthe', 'fix #343','rebuild version 1.2.2 to support ...','high',0.5,'15.12.2012'));
		//console.log(tasks);

		options.response.send(tasks);
		return;
	};

	var arroptions = [];
	for (var key in options){
		arroptions.push('<tr><td><b>'+key+'</b></td><td>'+options[key].toString()+'</td></tr>');
	}
	var optionsString = '<table>'+arroptions.join('')+'</table>';

	var response = options.response;
	response.send('<h1>Operation: </h1>'+operation+'<h1>Options: </h1>'+optionsString);
};