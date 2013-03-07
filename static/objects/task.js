(function (exports) {
	exports.Task = function(id, owner, title, description, priority, progress, dueOn) {
		var self = this;
		this.id = id;		
		this.owner = owner;
		this.title = title;
		this.description = description;
		this.priority = priority;
		this.progress = progress;
		this.dueOn = dueOn;
		return self;
	};
})(typeof exports === 'undefined' ? this['Computas']={} : exports);