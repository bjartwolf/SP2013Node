(function (ns) {

    ns.Task = function (id, owner, title, description, priority, progress, dueOn) {
        var self = this;
        this.id = id || 0;
        this.owner = ko.observable(owner);
        this.title = ko.observable(title || '');
        this.description = ko.observable(description || '');
        this.priority = ko.observable(priority || 'low');
        this.progress = ko.observable(progress || 0.0);
        this.dueOn = ko.observable(new Date(dueOn || null));

        this.cssClass = ko.computed(function () {
            return self.priority() == 'high' ? ' bg-color-red' : 'bg-color-green';
        });
        this.propagate = true;//set temporarily to false when you don't want the object changes to be pushed to server/Sockets
    };

})(window);