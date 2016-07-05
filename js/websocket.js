// UTF8 without BOM

var websock = {
}




websock.create = function( url, proto, on_open, on_message, on_close )
{
    var ws = new WebSocket(url, proto);

    ws.onopen       = typeof(on_open) == "function" ? on_open : ws.onopen;
    ws.onmessage    = typeof(on_message) == "function" ? on_message : ws.onmessage;
    ws.onclose      = typeof(on_close) == "function" ? on_close : ws.onclose;

    return ws;
}




// do it when window is fully loaded
websock.js_init = function()
{
    console.log("websock.js_init()");
}




window.addEventListener( "DOMContentLoaded", websock.js_init );
