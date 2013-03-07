(function (ns) {

	var Task=function(owner, title, description, priority,progress,dueOn){
		var self = this;
		this.id=0;
		this.owner=ko.observable(owner);
		this.title=ko.observable(title || '');
		this.description=ko.observable(description);
		this.priority = ko.observable(priority);
		this.progress = ko.observable(progress);
		this.dueOn=ko.observable(dueOn);
		
		this.cssClass = ko.computed(function(){
			return self.priority() == 'high' ? ' bg-color-red' : 'bg-color-green';
		});
	};

    ns.TasksViewModel = function () {
		var self = this;
		
		this.tasks=ko.observableArray();
	
		this.tasks.push(new Task('Sarah', 'fix #34','when user create ..','high',0.5,'15.12.2012'));
		this.tasks.push(new Task('John', 'fix #35','The dashboard is missing ..','low',0.5,'15.12.2012'));
		this.tasks.push(new Task('Rachel', 'fix #234','expand the bagdes','high',0.5,'15.12.2012'));
		this.tasks.push(new Task('Maxim', 'enhancement #234','add a ui to..','low',0.5,'15.12.2012'));
		this.tasks.push(new Task('Marthe', 'fix #343','rebuild version 1.2.2 to support ...','high',0.5,'15.12.2012'));

    };



})(window);