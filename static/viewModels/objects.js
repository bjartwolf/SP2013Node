(function (ns) {

    ns.Task = function (id, owner, title, description, priority, progress, dueOn) {
        var self = this;
        this.id = id || 0;
        this.owner = ko.observable(owner);
        this.title = ko.observable(title || '');
        this.description = ko.observable(description || '');
        this.priority = ko.observable(priority || 'low');
        this.progress = ko.observable(progress || 0.0);
        this.dueOn = ko.observable(dueOn?new Date(dueOn):new Date());

		this.formattedDueOn = ko.computed(function() {
			
			var d = self.dueOn();
			var dd = d.getDate()
			if ( dd < 10 ) dd = '0' + dd;

			 var mm = d.getMonth()+1
			 if ( mm < 10 ) mm = '0' + mm;

			 var yy = d.getFullYear() % 100
			 if ( yy < 10 ) yy = '0' + yy;
			 
			  return dd+'.'+mm+'.'+yy;
		});
		
        this.cssClass = ko.computed(function () {
			var cssclass ='';
			switch(self.priority()) {
				
				case 'low':
				cssclass = 'bg-color-green';
				break;
				
				case 'normal':
				cssclass = 'bg-color-gray';
				break;
				
				case 'high':
				cssclass = 'bg-color-red';
			}
            return cssclass;
        });
		
        this.propagate = true;//set temporarily to false when you don't want the object changes to be pushed to server/Sockets
    };

})(window);