(function (exports) {
	exports.Task = function(id, owner, title, description, priority, progress, dueOn, modified) {
		var self = this;
		this.ID = id;		
		this.AuthorId = owner; //16
		this.Title = title;
		this.Body = description;
		this.Priority = priority; //(2) Normal
		this.PercentComplete = progress; //100
		this.DueDate = dueOn; //
		this.Modified = modified; //2013-03-07T21:00:18Z
		return self;
	};
})(typeof exports === 'undefined' ? this['Computas']={} : exports);