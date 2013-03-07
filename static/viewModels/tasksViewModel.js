(function (ns) {
    var Task = ns.Task;


    ns.TasksViewModel = function () {
		var self = this;		
		this.tasks = ko.observableArray();


		this.addTask = function (task) {
		    task.progress.subscribe(function (val) {
		        self.onTaskChange(task,'progress',val);
		    });

		    self.tasks.push(task);
		};

		this.onTaskChange = function (task, property, value) {
		    if (task.propagate === false) {
		        return;
		    }
		    var msg = { id: task.id, property: value };
		    if (ns.socket) {
		        socket.emit('moveEvent', msg);
		    }
		};


		this.createNewTask = function () {
			var newTask = new Task('You','Rule','So much','high',0.5,'07.03.2013');
			self.addTask(newTask);
			setTimeout(function () {
			    newTask.progress(50);
			}, 1000);
		};

		this.tasks.push(new Task('Sarah', 'fix #34','when user create ..','high',0.5,'15.12.2012'));
		this.tasks.push(new Task('John', 'fix #35','The dashboard is missing ..','low',0.5,'15.12.2012'));
		this.tasks.push(new Task('Rachel', 'fix #234','expand the bagdes','high',0.5,'15.12.2012'));
		this.tasks.push(new Task('Maxim', 'enhancement #234','add a ui to..','low',0.5,'15.12.2012'));
		this.tasks.push(new Task('Marthe', 'fix #343', 'rebuild version 1.2.2 to support ...', 'high', 0.5, '15.12.2012'));

		ns.socket.on('moveEvent', function (msg) {
		    var tasks = self.tasks();
		    for (var i = 0; i < self.tasks().length; i++) {
		        if (tasks[i].id == msg.id) {
		            delete msg.id;
		            task[i].propagate = false;
		            for (var p in msg) {
		                tasks[i][p](msg[p]);
		            }
		            task[i].propagate = true;
		            return;
		        }
		    }
		});

		
    };



})(window);