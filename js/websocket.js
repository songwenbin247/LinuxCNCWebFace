// UTF8 without BOM

var websock = {
    hal: {
        url: "ws://"+parent.location.hostname+"/halrmt",
        proto: "telnet",
        sock: false,
        errCode: 0,
        errText: "No errors"
    },
    lcnc: {
        url: "ws://"+parent.location.hostname+"/linuxcncrsh",
        proto: "telnet",
        sock: false,
        errCode: 0,
        errText: "No errors"
    },

    checkInterval: 1000
}




websock.connection_test = function()
{
    if ( !parent.location.protocol.match("http") ) return;

    if ( websock.hal.sock && websock.hal.sock.readyState == 1 ) {
        if ( log && log.add && !hal_available ) log.add("[WEBSOCK] HAL is here", "green");
        hal_available = true;
    } else {
        if ( log && log.add && hal_available ) {
            log.add("[WEBSOCK] HAL isn't available ("+websock.hal.errCode+":"+websock.hal.errText+")", "red");
        }
        hal_available = false;
        websock.connect2hal();
    }

    if ( websock.lcnc.sock && websock.lcnc.sock.readyState == 1 ) {
        if ( log && log.add && !lcnc_available ) log.add("[WEBSOCK] LCNC is here", "green");
        lcnc_available = true;
    } else {
        if ( log && log.add && lcnc_available ) {
            log.add("[WEBSOCK] LCNC isn't available ("+websock.lcnc.errCode+":"+websock.lcnc.errText+")", "red");
        }
        lcnc_available = false;
        websock.connect2lcnc();
    }
}

websock.connect2hal = function()
{
    if ( !parent.location.protocol.match("http") ) return;

    var onclose = (websock.hal.sock && websock.hal.sock.onclose) ? 
        websock.hal.sock.onclose :
        function(event) {
            websock.hal.errCode = event.code;
            websock.hal.errText = event.reason;
        };

    var onerror = (websock.hal.sock && websock.hal.sock.onerror) ? 
        websock.hal.sock.onerror :
        function(event) {
            websock.hal.errCode = 0;
            websock.hal.errText = event.message;
        };

    var onmessage = (websock.hal.sock && websock.hal.sock.onmessage) ? 
        websock.hal.sock.onmessage :
        function(event) {
            if ( log && log.add) log.add( "[HAL] " + event.data );
        };

    websock.hal.sock = new WebSocket(websock.hal.url, websock.hal.proto);
    websock.hal.sock.onclose = onclose;
    websock.hal.sock.onerror = onerror;
    websock.hal.sock.onmessage = onmessage;
}
websock.connect2lcnc = function()
{
    if ( !parent.location.protocol.match("http") ) return;

    var onclose = (websock.lcnc.sock && websock.lcnc.sock.onclose) ? 
        websock.lcnc.sock.onclose :
        function(event) {
            websock.lcnc.errCode = event.code;
            websock.lcnc.errText = event.reason;
        };

    var onerror = (websock.lcnc.sock && websock.lcnc.sock.onerror) ? 
        websock.lcnc.sock.onerror :
        function(event) {
            websock.lcnc.errCode = 0;
            websock.lcnc.errText = event.message;
        };

    var onmessage = (websock.lcnc.sock && websock.lcnc.sock.onmessage) ? 
        websock.lcnc.sock.onmessage :
        function(event) {
            if ( log && log.add) log.add( "[LCNC] " + event.data );
        };

    websock.lcnc.sock = new WebSocket(websock.lcnc.url, websock.lcnc.proto);
    websock.lcnc.sock.onclose = onclose;
    websock.lcnc.sock.onerror = onerror;
    websock.lcnc.sock.onmessage = onmessage;
}




// do it when window is fully loaded
websock.js_init = function()
{
    console.log("websock.js_init()");

    websock.connect2hal();
    websock.connection_test_timer = setInterval( websock.connection_test, websock.checkInterval );
}




window.addEventListener( "DOMContentLoaded", websock.js_init );
