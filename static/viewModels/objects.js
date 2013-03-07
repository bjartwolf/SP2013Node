(function (ns) {

    ns.Task = function (owner, title, description, priority, progress, dueOn) {
        var self = this;
        this.id = 0;
        this.owner = ko.observable(owner);
        this.title = ko.observable(title || '');
        this.description = ko.observable(description);
        this.priority = ko.observable(priority);
        this.progress = ko.observable(progress);
        this.dueOn = ko.observable(dueOn);

        this.cssClass = ko.computed(function () {
            return self.priority() == 'high' ? ' bg-color-red' : 'bg-color-green';
        });
    };

})(window);