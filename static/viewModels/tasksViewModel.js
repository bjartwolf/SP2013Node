(function (ns) {
    var Task = ns.Task;


    ns.TasksViewModel = function () {
		var self = this;		
		this.tasks=ko.observableArray();
		this.createNewTask = function () {
			var newTask = new Task('You','Rule','So much','high',0.5,'07.03.2013');
			self.tasks.push(newTask);
		};

		this.tasks.push(new Task('Sarah', 'fix #34','when user create ..','high',0.5,'15.12.2012'));
		this.tasks.push(new Task('John', 'fix #35','The dashboard is missing ..','low',0.5,'15.12.2012'));
		this.tasks.push(new Task('Rachel', 'fix #234','expand the bagdes','high',0.5,'15.12.2012'));
		this.tasks.push(new Task('Maxim', 'enhancement #234','add a ui to..','low',0.5,'15.12.2012'));
		this.tasks.push(new Task('Marthe', 'fix #343','rebuild version 1.2.2 to support ...','high',0.5,'15.12.2012'));
		
    };



})(window);