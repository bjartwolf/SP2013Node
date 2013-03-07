exports = module.exports = function (operation, options){
	var arroptions = [];
	for (var key in options){
		arroptions.push('<tr><td><b>'+key+'</b></td><td>'+options[key].toString()+'</td></tr>');
	}
	var optionsString = '<table>'+arroptions.join('')+'</table>';

	var response = options.response;
	response.send('<h1>Operation: </h1>'+operation+'<h1>Options: </h1>'+optionsString);
};