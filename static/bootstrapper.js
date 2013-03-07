var socket = io.connect(location.origin + '/SPio');
socket.on('sendTimer', function (data) {
    console.log('sending timer');
    var time = Date.now();
    socket.emit('timerSent', { time: time });
});
socket.on('timerPingback', function (data) {
    console.log('recieved pingback');
    console.log(data);
    console.log(Date.now());
    console.log(Date.now() - data.time);
    toastr.info(Date.now() - data.time);
});
socket.on('yo', function (data) {
    console.log(data);
});
$(document).ready(function () {
    var scriptbase = "#{siteUrl}" + "/_layouts/15/";
    $.getScript(scriptbase + "SP.RequestExecutor.js", execCrossDomainRequest);
    var options = {};
    options.siteTitle = "Awesome app";
    options.siteUrl = "#{siteUrl}";
    options.appTitle = "BjartwolfIncNodeApp";
    var nav = new SP.UI.Controls.Navigation("SPChrome", options);
    $.getScript(scriptbase + 'SP.Runtime.js', function () {
        $.getScript(scriptbase + 'SP.js', function () {
            $.getScript(scriptbase + 'init.js', function () {
                $.getScript(scriptbase + 'SP.UserProfiles.js', function () { });
                registerContextAndProxy();
            });
        });
    });

    var vm=new TasksViewModel();
    ko.applyBindings(vm);

});
function registerContextAndProxy() {
    context = new SP.ClientContext(appweburl);
    var factory = new SP.ProxyWebRequestExecutorFactory(appweburl);
    context.set_webRequestExecutorFactory(factory);
    appContextSite = new SP.AppContextSite(context, hostweburl);
    this.web = appContextSite.get_web();
    context.load(this.web);
    context.executeQueryAsync(
        Function.createDelegate(this, successHandler),
        Function.createDelegate(this, errorHandler)
    );
    function successHandler() {
        document.getElementById("HostwebTitle").innerHTML =
        "<b>" + this.web.get_title() + "</b>";
    }
}

function execCrossDomainRequest() {
    var executor;
    // Initialize the RequestExecutor with the app web URL.
    executor = new SP.RequestExecutor(appweburl);
    // Issue the call against the host web.
    // To get the title using REST we can hit the endpoint:
    //      app_web_url/_api/SP.AppContextSite(@target)/web/title?@target='siteUrl'
    // The response formats the data in the JSON format.
    // The functions successHandler and errorHandler attend the
    //      success and error events respectively.
    requestUrl = appweburl + "/_api/SP.AppContextSite(@target)/web/title?@target='" + hostweburl + "'";
    console.log(requestUrl);
    executor.executeAsync({
        url: requestUrl,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: successHandler,
        error: errorHandler
    }
    );
}
function successHandler(data) {
    var jsonObject = JSON.parse(data.body);
    toastr.info(jsonObject.d.Title);
}
function errorHandler(data, errorCode, errorMessage) {
    toastr.error(errorMessage);
}