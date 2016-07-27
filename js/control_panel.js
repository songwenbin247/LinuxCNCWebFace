// UTF8 without BOM

/*
    Machine Main Controls
    play,pause,stop,e-stop,on,off
*/

// settings vars and functions
var ctrl =
{
    db: {},

    lcncsock:           false,
    lcncsock_open:      false,

    update_interval:    500,
};

// local strings to translate
var lng_local_dic =
[
    { en:"E-STOP", ru:"Е-СТОП" },
    { en:"ON", ru:"ВКЛ" },
    { en:"OFF", ru:"ВЫКЛ" },
    { en:"Emergency STOP", ru:"Экстренный СТОП" },
    { en:"Run opened program", ru:"Запустить открытую программу" },
    { en:"Pause or resume program", ru:"Приостановить или возобновить программу" },
    { en:"Abort program or MDI movements", ru:"Остановить программу или любые MDI движения" },
    { en:"Machine OFF", ru:"Выключить станок" },
    { en:"Machine ON", ru:"Включить станок" },
];

// add local strings to translate to the global translate list
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];
lng.dic = lng.dic.concat(lng_local_dic);




// have we a localStorage?
if ( window.localStorage ) ctrl.db = window.localStorage;




ctrl.lcncsock_onopen = function(e)
{
    if ( !ctrl.lcncsock_open ) log.add("[CTRL] [LCNC] Socket is open","green");
    ctrl.lcncsock_open = true;
    // send hello with some passwords
    ctrl.lcncsock.send("hello "+LINUXCNCRSH_HELLO_PASSWORD+" ctrllcnc 1\r\n");
    // disable echo in answers
    ctrl.lcncsock.send(
        "set enable "+LINUXCNCRSH_ENABLE_PASSWORD+"\r\n"+
        "set echo off\r\n"+
        "set enable off\r\n"
    );
}
ctrl.lcncsock_onmessage = function(e)
{
    var lines = e.data.match(/[^\r\n]+[\r\n]+/igm);

    for ( var n = 0; n < lines.length; n++ ) 
    {
        if ( lines[n].match(/^program_status/i) ) {
            var state = lines[n].match(/program_status\s+(idle|running|paused)/i)[1].toLowerCase();
            switch (state) {
                case "running":
                    document.querySelector("#program_play").classList.add("enabled");
                    document.querySelector("#program_pause").classList.remove("enabled");
                    document.querySelector("#program_abort").classList.remove("enabled");
                    break;
                case "paused":
                    document.querySelector("#program_play").classList.remove("enabled");
                    document.querySelector("#program_pause").classList.add("enabled");
                    document.querySelector("#program_abort").classList.remove("enabled");
                    break;
                default: // idle
                    document.querySelector("#program_play").classList.remove("enabled");
                    document.querySelector("#program_pause").classList.remove("enabled");
                    document.querySelector("#program_abort").classList.add("enabled");
            }
        }
        else if ( lines[n].match(/^estop/i) ) {
            var state = lines[n].match(/estop\s+(on|off)/i)[1].toLowerCase();
            switch (state) {
                case "on":
                    document.querySelector("#machine_estop").classList.add("enabled");
                    break;
                default: // off
                    document.querySelector("#machine_estop").classList.remove("enabled");
            }
        }
        else if ( lines[n].match(/^machine/i) ) {
            var state = lines[n].match(/machine\s+(on|off)/i)[1].toLowerCase();
            switch (state) {
                case "on":
                    document.querySelector("#machine_on").classList.add("enabled");
                    document.querySelector("#machine_off").classList.remove("enabled");
                    break;
                default: // off
                    document.querySelector("#machine_on").classList.remove("enabled");
                    document.querySelector("#machine_off").classList.add("enabled");
            }
        }
    }
}
ctrl.lcncsock_onclose = function(e)
{
    if ( ctrl.lcncsock_open ) log.add("[CTRL] [LCNC] Socket is closed ("+e.code+":"+e.reason+")","red");
    ctrl.lcncsock_open = false;
}

ctrl.check_sockets = function()
{
    if ( !parent.location.protocol.match("http") ) return;
    if ( !ctrl.lcncsock_open ) {
        ctrl.lcncsock = websock.create(LCNCSOCK_URL, SOCK_PROTO, ctrl.lcncsock_onopen, ctrl.lcncsock_onmessage, ctrl.lcncsock_onclose);
    }
}




ctrl.update = function()
{
    if ( !ctrl.lcncsock_open ) return;

    ctrl.lcncsock.send(
        "get program_status\r\n" +
        "get estop\r\n" +
        "get machine\r\n"
    );
}




// do it when window is fully loaded
ctrl.js_init = function()
{
    console.log("ctrl.js_init()");

    // create sockets to talk with LCNC
    if ( parent.location.protocol.match("http") ) {
        ctrl.lcncsock = websock.create(LCNCSOCK_URL, SOCK_PROTO, ctrl.lcncsock_onopen, ctrl.lcncsock_onmessage, ctrl.lcncsock_onclose);
    }
    // create check timer for these sockets
    setInterval(ctrl.check_sockets, SOCK_CHECK_INTERVAL);

    // start units update process
    ctrl.update_timer = setInterval( ctrl.update, ctrl.update_interval );
}




window.addEventListener( "DOMContentLoaded", ctrl.js_init );
