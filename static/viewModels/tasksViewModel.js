(function (ns) {

    ns.TasksViewModel = function () {
		var self = this;
		
		this.tasks=ko.observableArray();
	
		this.tasks.push(new Task());

    };



})(window);