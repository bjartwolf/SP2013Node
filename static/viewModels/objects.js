(function (ns) {
    ns.counter = (function (init) {
        var count = init;
        return function () {
            count++;
            return count;
        }
    })(0);
    ns.Task = function (id, owner, title, description, priority, progress, dueOn) {
        var self = this;
        this.id = id || 0;
        this.uniqueSmallNumber = ko.observable(ns.counter());
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
		
		this.formattedProgress = ko.computed(function () {
		    return Math.round(self.progress()*100) + '%';
		});
        
		this.userImage = ko.computed(function () {
			var smallNumber = self.uniqueSmallNumber();
			if (smallNumber < 10) {
				return "http://placekitten.com/20" +smallNumber + "/20" + smallNumber;
				} else {
				return "http://placekitten.com/2" +smallNumber + "/2" + smallNumber;			
				}
		});

        this.cssClass = ko.computed(function () {
			var cssclass ='';
			switch(self.priority()) {
				
				case '(3) Low':
				cssclass = 'bg-color-green';
				break;
				
				case '(2) Normal':
				cssclass = 'bg-color-gray';
				break;
				
				case '(1) High':
				cssclass = 'bg-color-red';
			}
            return cssclass;
        });
		
        this.propagate = true;//set temporarily to false when you don't want the object changes to be pushed to server/Sockets
    };

})(window);