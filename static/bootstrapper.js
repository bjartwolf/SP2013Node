var socket = io.connect(location.origin + '/SPio');
socket.on('sendTimer', function (data) {
    //console.log('sending timer');
    var time = Date.now();
    //socket.emit('timerSent', { time: time });
});
socket.on('timerPingback', function (data) {
    /*console.log('recieved pingback');
    console.log(data);
    console.log(Date.now());
    console.log(Date.now() - data.time);*/
    toastr.info(Date.now() - data.time);
});
socket.on('yo', function (data) {
    //console.log(data);
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

    var vm = new TasksViewModel();
    ko.applyBindings(vm);
	
	$('.tile').dblclick(function(){
		if($(this).hasClass('selected')) {
			$(this).removeClass('selected');
		}
		else {
			$(this).addClass('selected');
		}
	});
	
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
    //console.log(requestUrl);
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




(function (leap) {
    if (!leap) {
        console.log('no leap');
        return;
    }
    var cursor = null;
    $(document).ready(function () {
        $('body').append('<div id="cursor" style="border:1px solid red;position:absolute;width:10px;height:10px;"></div>');
        cursor = $('#cursor');
    });

    var previousFrame;
    var paused = false;
    var pauseOnGesture = false;
    var isDown = false;
    var sxScale = window.screen.width/450;
    var syScale = 2.0;
    var hoverElement = null;
    var previousElement = null;

    // Setup Leap loop with frame callback function
    var controllerOptions = { enableGestures: true };

    leap.loop(controllerOptions, function (frame, done) {
        //var hand = frame.hands[0];
        var finger = frame.fingers[0];
        if (finger && finger.valid) {
            var p = finger.tipPosition,
                px = p[0], py = p[1], pz = p[2],
                sx = Math.floor(sxScale * (px + 150)), sy = Math.floor(syScale * (500 - py));
            previousElement = hoverElement;
            hoverElement = document.elementFromPoint(sx, sy);
            if (pz < 0 && !isDown) {
                isDown = true;
                simulateMouseDown(sx, sy);
                cursor[0].style.background='green';
            } else if (pz > 0 && isDown) {
                isDown = false;
                simulateMouseClick(sx, sy);
                simulateMouseUp(sx, sy);
                cursor[0].style.background = 'transparent';
            }
            simulateMouseMove(sx, sy);
        }
        if (frame.gestures && frame.gestures.length > 0) {
            var g = frame.gestures[0];
            if (g.state == 'stop') {
                
                if (g.type == "swipe") {
                    if (isDown) {
                        done();
                        return;
                    }
                    if (g.direction[0] < 0) {
                        console.log('swipe left');
                        simulateEvent('swipeLeft');
                    } else {
                        console.log('swipe right');
                        simulateEvent('swipeRight');
                    }
                }
            }
            
        }
        done();
    });

    function simulateMouseClick(x, y) {
        if (!hoverElement) {
            return;
        }
        console.log('click ' + x + ', ' + y);
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", true, true, window,
          0, x+window.screenLeft, y+window.screenTop, x, y, false, false, false, false, 0, null);
        var canceled = !hoverElement.dispatchEvent(evt);

    }

    function simulateMouseMove(x, y) {
        //console.log('move ' + x + ', ' + y);
        if (cursor) {
            cursor.offset({ top: y+10, left: x+10});

        }
        var cb = hoverElement;
        if (!cb) {
            return;
        }
        console.log(cb.id);
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("mousemove", true, true, window,
          0, x + window.screenLeft, y + window.screenTop, x, y, false, false, false, false, 0, previousElement);
        var canceled = !cb.dispatchEvent(evt);
    }

    function simulateMouseDown(x, y) {

        var cb = hoverElement;
        if (!cb) {
            return;
        }
        console.log(cb.id);
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("mousedown", true, true, window,
          0, x + window.screenLeft, y + window.screenTop, x, y, false, false, false, false, 0, null);


        var canceled = !cb.dispatchEvent(evt);

    }
    function simulateMouseUp(x, y) {

        var cb = hoverElement;
        if (!cb) {
            return;
        }
        console.log(cb.id);
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("mouseup", true, true, window,
          0, x + window.screenLeft, y + window.screenTop, x, y, false, false, false, false, 0, null);


        var canceled = !cb.dispatchEvent(evt);

    }

    function simulateEvent(myEvent) {
        var event;
        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent(myEvent, true, true);
        } else {
            event = document.createEventObject();
            event.eventType = myEvent;
        }

        /*event.eventName = myEvent;
        event.memo = memo || {};*/

        if (document.createEvent) {
            document.dispatchEvent(event);
        } else {
            document.fireEvent("on" + event.eventType, event);
        }
    }


})(Leap || null);
