(function (exports) {
	exports.Task = function(id, title, owner, description, priority, progress, dueOn) {
		var self = this;
		this.id = id;
		this.title = title;
		this.owner = owner;
		this.description = description;
		this.priority = priority;
		this.progress = progress;
		this.dueOn = dueOn;
		return self;
	};
})(typeof exports === 'undefined' ? this['Computas']={} : exports);