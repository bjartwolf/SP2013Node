(function (exports) {
	exports.Task = function(id, owner, title, description, priority, progress, dueOn) {
		var self = this;
		this.ID = id;		
		this.Author = owner;
		this.Title = title;
		this.Body = description;
		this.Priority = priority;
		this.PercentComplete = progress;
		this.DueDate = dueOn;
		return self;
	};
})(typeof exports === 'undefined' ? this['Computas']={} : exports);