var request = require('request');   

function dummyintegration (operation, options, io) {
	if (operation === "GetAll" && options.entitytype === "task") {
		var Task = require('./static/objects/task.js').Task;
		var tasks = [];
		tasks.push(new Task(1,'Sarah', 'fix #34','when user create ..','high',0.5,'10.12.2012'));
		tasks.push(new Task(2,'John', 'fix #35','The dashboard is missing ..','low',0.5,'10.12.2012'));
		tasks.push(new Task(3,'Rachel', 'fix #234','expand the bagdes','high',0.5,'10.12.2012'));
		tasks.push(new Task(4,'Maxim', 'enhancement #234','add a ui to..','low',0.5,'10.12.2012'));
		tasks.push(new Task(5,'Marthe', 'fix #343','rebuild version 1.2.2 to support ...','high',0.5,'10.12.2012'));
		//console.log(tasks);

		options.response.send(tasks);
		return;
	}

	if (options.entitytype === 'task' && operation === 'Create') {
	    var task = JSON.parse(options.body.task);
	    task.id = new Date().getTime();
	    console.log(task);
		io.of('/SPio').emit('newTask', task);
		return;
	};
}

exports = module.exports = dummyintegration; //SPIntegration

function SPIntegration (operation, options, io){	
	if (options.entitytype === 'task' && operation === 'Create'){
		(function (req, res) {
	        var headers = {
	            'Accept': 'application/json;odata=verbose',
	            'Authorization' : 'Bearer ' + req.user.accessToken
	        };	        
	        var options = {
	            url: req.user.host + '/_api/contextinfo', 
	            headers : headers
	        };
	        request.post(options, function(error, response, body) {
	            var b = JSON.parse(body);
	            var formdigest = b.d.GetContextWebInformation.FormDigestValue;
	            var headers2 = {
	                'Accept': 'application/json;odata=verbose',
	                'content-type': 'application/json;odata=verbose',
	                'X-RequestDigest': formdigest,
	                'Authorization' : 'Bearer ' + req.user.accessToken
	            };

	            var item = req.body;
	            item.__metadata = { 'type': 'SP.Data.TasksListItem'};	            
	    
	            var options2 = {
	              url: req.user.host + "/_api/lists/GetByTitle('Tasks')/items", 
	              body: JSON.stringify(item),
	              headers : headers2,
	              method: 'POST',
	            };
	            request.post(options2, function (e, r, b) {
	              var bb = JSON.parse(b);
	              req.body.id = bb.d.ID;
	              
	              io.of('/SPio').emit('newTask', req.body);
	              res.send(b);
	            });
	        });
    	})(options.request, options.response);
	}

	if (options.entitytype === 'task' && operation === 'Get') {
		(function (req, res, options) {			            
	        var headers = {
	            'Accept': 'application/json;odata=verbose',
	            'Authorization' : 'Bearer ' + req.user.accessToken
	        };
	        var id = options.id;
	        var options = {
	            url: req.user.host + '/_api/lists/GetByTitle(\'Tasks\')/items('+id+')', 
	            headers : headers
	        };
	        
	        request.get(options, function(error, response, body) {	        	
	            var b = JSON.parse(body);
	            console.log(b.d);
	           	res.send(b.d); 
	        });
    	})(options.request, options.response, options);
	}

	if (options.entitytype === 'task' && operation === 'GetAll') {
		(function (req, res, options) {			            
	        var headers = {
	            'Accept': 'application/json;odata=verbose',
	            'Authorization' : 'Bearer ' + req.user.accessToken
	        };
	        var id = options.id;
	        var options = {
	            url: req.user.host + '/_api/lists/GetByTitle(\'Tasks\')/items', 
	            headers : headers
	        };
	        
	        request.get(options, function(error, response, body) {	        	
	            var b = JSON.parse(body);
	            console.log(b.d.results);
	           	res.send(b.d.results); 
	        });
    	})(options.request, options.response, options);
	}	
};