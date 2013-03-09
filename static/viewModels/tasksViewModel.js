(function (ns) {
    var Task = ns.Task;
    var ServerTask = ns.Computas.Task;

    ns.TasksViewModel = function () {
		var self = this;		
		self.tasks = ko.observableArray();

		self.newTaskVisible = ko.observable(false);
		self.newTaskTitle = ko.observable('');
		self.newTaskDescription = ko.observable('');
		self.newTaskPriority = ko.observable('(2) Normal');
		self.newTaskProgress = ko.observable(0);
		//self.priorities = ko.observableArray(['(1) High', '(2) Normal', '(3) Low']);

		self.createNewTask = function () {
		    var pri = self.newTaskPriority();
		    var task = new Task(0, 0, self.newTaskTitle(), self.newTaskDescription(), self.newTaskPriority(), self.newTaskProgress());//todo:add duedate
		    self.saveTask(task);
		    self.newTaskTitle('');
		    self.newTaskDescription('');
		    self.newTaskPriority('(2) Normal');
		    self.newTaskProgress(0);
		    self.newTaskVisible(false);
		};

		self.toggleCreateTask = function(){
		    self.newTaskVisible(!self.newTaskVisible());
		}
		self.newTaskVisible.subscribe(function(val){
		    if(val){
		        $('#createTaskPane').animate({ right: 0 });
		        $('#createTaskButton').removeClass('icon-arrow-left-3');
		        $('#createTaskButton').addClass('icon-arrow-right-3');
		    }else{
		        $('#createTaskPane').animate({ right: -430 });
		        $('#createTaskButton').removeClass('icon-arrow-right-3');
		        $('#createTaskButton').addClass('icon-arrow-left-3');
		    }
		});


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
		    var appTask = self.AppTask2ServerTask(task);	
		    var data = 'task='+ko.toJSON(appTask);
		    //var data = self.AppTask2ServerTask(appTask);	
		    var url = '/_api/task';
		    if(task.id){
		    	url = url + '/'+ task.id;
		    }
		    $.ajax({
		        type: "POST",
		        url: url,
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


		/*self.createNewTask = function () {
			var newTask = new Task( 0, 16 ,'Rule'+new Date().getSeconds(),'So much','(3) Low',0.2,'07.03.2013');
			self.saveTask(newTask);
		};*/

		self.AppTask2ServerTask=function(task){
		    var newTask = new ServerTask(task.id, task.owner, task.title, task.description, task.priority, task.progress, task.dueOn);
		    return newTask;

		};

		self.serverTask2AppTask=function(task){

		    var newTask = new Task(task.ID, task.AuthorId, task.Title, task.Body, task.Priority, task.PercentComplete, task.DueDate);
		    return newTask;

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
			return jQuery.grep( self.tasks(), function(task) { return task.priority() == '(1) High' })
			},this);
			
		self.normalPriorityTasks = ko.computed(function(){
			return jQuery.grep(self.tasks(), function(task){ return task.priority() == '(2) Normal' })
			},this);

		self.lowPriorityTasks = ko.computed(function(){
			return jQuery.grep(self.tasks(), function(task){ return task.priority() == '(3) Low' })
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
		
		self.changePriority =function(event, ui){
		    var task = ui.draggable[0].value;
		    switch (this.id) {
		        case 'lowPriority':
		            task.priority('(3) Low');
		            break;
		        case 'normalPriority':
		            task.priority('(2) Normal');
		            break;
                case 'highPriority':
		                task.priority('(1) High');
		                break;
		    }
			
		};
		self.onDropTask = function (event, ui) {
		    var task = ui.draggable[0].value;
		    self.saveTask(task);
            //TODO:uncomment the above line when server is ready to update
		};
		self.onDragTask = function (event, ui) {
		    var task = this.value;
		    var x = event.pageX-event.offsetX;
		    var p = $('#taskboard');
		    x -= p.position().left;
		    x /= p.width();
		    task.progress(x);
		   // task.progress();
		};

		self.progressToPosition = function (progress) {
		    var p = $('#taskboard');
		    var tiles = $('.tile');
		    var tilewidth = tiles[0].offsetWidth;
		    return Math.floor(progress() * (p.width() - tilewidth)) + 'px';
		};
		
    };

})(window);