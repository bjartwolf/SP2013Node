ko.bindingHandlers.ui = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
		var allBindings = allBindingsAccessor();
		var text="", options;
		var type = allBindings.ui.type || allBindings.ui || null;
		options = allBindings.ui.options || null;

        $(element)[type](options);
    }
};
