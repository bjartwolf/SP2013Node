(function (ns) {
    var Task = ns.Task;

    ns.TasksViewModel = function () {
		var self = this;		
		self.tasks = ko.observableArray();


		self.addTask = function (task) {
		    task.priority.subscribe(function (val) {
		        self.onTaskChange(task, 'priority', val);
		    });
		    task.progress.subscribe(function (val) {
		        self.onTaskChange(task,'progress',val);
		    });
		    task.title.subscribe(function (val) {
		        self.onTaskChange(task, 'title', val);
		    });
		    task.description.subscribe(function (val) {
		        self.onTaskChange(task, 'description', val);
		    });
		    self.tasks.push(task);
		};

		self.saveTask = function (task, callback) {
		    var data = 'task='+ko.toJSON(task);
		    $.ajax({
		        type: "POST",
		        url: '/_api/task',
		        data: data,
		        dataType: 'json',
		        success: function (data) {
		            console.log('task saved');
		            console.log(data);
		            if (callback) {
		                callback(null, data);
		            }
		        } 
		    });
		};


		self.onTaskChange = function (task, property, value) {
		    if (task.propagate === false) {
		        return;
		    }
		    var msg = { id: task.id };
		    msg[property] = value;
		    if (ns.socket) {
		        socket.emit('moveEvent', msg);
		    }
		};


		self.createNewTask = function () {
			var newTask = new Task( 0,'You','Rule','So much','high',0.5,'07.03.2013');
			self.saveTask(newTask);
		};

		self.serverTask2AppTask=function(task){
		    return new Task(task.id, task.owner, task.title, task.description, task.priority, task.progress, task.dueOn);

		};

		self.setTasks = function (tasks) {
		    if (self.tasks) {
		        self.tasks([]);
		    }
		    for (var i in tasks) {
		        self.addTask(self.serverTask2AppTask(tasks[i]));
		    }
		};
		self.getAllTasks = function () {
		    $.getJSON('/_api/task', self.setTasks);
		};

		self.getAllTasks();

		self.highPriorityTasks = ko.computed( function() {
			return jQuery.grep( self.tasks(), function(task) { return task.priority() == 'high' })
			},this);
			
		self.normalPriorityTasks = ko.computed(function(){
			return jQuery.grep(self.tasks(), function(task){ return task.priority() == 'normal' })
			},this);

		self.lowPriorityTasks = ko.computed(function(){
			return jQuery.grep(self.tasks(), function(task){ return task.priority() == 'low' })
			},this);	
			
		ns.socket.on('moveEvent', function (msg) {
		    var tasks = self.tasks();
		    for (var i = 0; i < self.tasks().length; i++) {
		        if (tasks[i].id == msg.id) {
		            delete msg.id;
		            tasks[i].propagate = false;
		            for (var p in msg) {
		                tasks[i][p](msg[p]);
		            }
		            tasks[i].propagate = true;
		            return;
		        }
		    }
		});

		ns.socket.on('newTask', function (task) {
		    var task = self.serverTask2AppTask(task);
		    self.addTask(task);
		});
		
    };



})(window);