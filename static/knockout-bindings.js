ko.bindingHandlers.tileslider = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var allBindings = allBindingsAccessor();
        var text = "", options;
        //var type = allBindings.ui.type || allBindings.ui || null;
        options = allBindings.tileslider.options || {};
        setTimeout(function () {
            $(element).tileBlockSlider(options);
        }, Math.random() * 3000);
    }
};
