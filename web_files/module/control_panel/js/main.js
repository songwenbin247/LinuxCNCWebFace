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
    
    machine_estop:      true,
    machine_on:         false,
    program_status:     "idle"
};

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
            ctrl.program_status = state;
            switch (state) {
                case "running":
                    ctrl.toggle_btn("program_play", true);
                    ctrl.toggle_btn("program_pause", false);
                    ctrl.toggle_btn("program_abort", false);
                    break;
                case "paused":
                    ctrl.toggle_btn("program_play", false);
                    ctrl.toggle_btn("program_pause", true);
                    ctrl.toggle_btn("program_abort", false);
                    break;
                default: // idle
                    ctrl.toggle_btn("program_play", false);
                    ctrl.toggle_btn("program_pause", false);
                    ctrl.toggle_btn("program_abort", true);
            }
        }
        else if ( lines[n].match(/^estop/i) ) {
            var state = lines[n].match(/estop\s+(on|off)/i)[1].toLowerCase();
            switch (state) {
                case "on":
                    ctrl.machine_estop = true;
                    ctrl.toggle_btn("machine_estop", true);
                    break;
                default: // off
                    ctrl.machine_estop = false;
                    ctrl.toggle_btn("machine_estop", false);
            }
        }
        else if ( lines[n].match(/^machine/i) ) {
            var state = lines[n].match(/machine\s+(on|off)/i)[1].toLowerCase();
            switch (state) {
                case "on":
                    ctrl.machine_on = true;
                    ctrl.toggle_btn("machine_on", true);
                    ctrl.toggle_btn("machine_off", false);
                    break;
                default: // off
                    ctrl.machine_on = false;
                    ctrl.toggle_btn("machine_on", false);
                    ctrl.toggle_btn("machine_off", true);
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




ctrl.exec = function ( outcmd )
{
    if ( !ctrl.lcncsock_open ) {
        log.add("[CTRL] LCNC socket isn't available","red");
        return;
    }
    if ( outcmd.trim() == "" ) return;

    ctrl.lcncsock.send(
        "set enable " + LINUXCNCRSH_ENABLE_PASSWORD + "\r\n" +
        outcmd +
        "set enable off\r\n"
    );

    log.add("[CTRL] lcnc " + outcmd);
}




ctrl.simpleClickAnimation = function ( id )
{
    var element = document.querySelector("#"+id),
        back    = element.style.backgroundColor;
    element.style.backgroundColor = "rgba(0,0,0,0.5)";
    setTimeout( 'document.querySelector("#'+id+'").style.backgroundColor = "'+back+'";', 200 );
}

ctrl.toggle_btn = function ( id, enable, animate ) {
    var element = document.querySelector("#"+id);
    if ( !element ) return;

    if ( enable ) element.classList.add("enabled");
    else element.classList.remove("enabled");

    if ( animate ) ctrl.simpleClickAnimation(id);
}




ctrl.btn_clicked = function ( event )
{
    var id;

    if ( /^(program|machine)_/.test(event.target.id) ) id = event.target.id;
    else if ( /^(program|machine)_/.test(event.target.parentElement.id) ) id = event.target.parentElement.id;
    else return;

    switch (id) {
        case "program_play": 
            if ( !ctrl.machine_on || ctrl.machine_estop || ctrl.program_status == "running" ) break;
            if ( ctrl.program_status == "paused" ) {
                ctrl.exec("set resume\r\n");
            } else {
                if ( typeof(prog) != "object" ) ctrl.exec("set mode auto\r\nset run\r\n");
                else ctrl.exec("set mode auto\r\nset run " + prog.current_line + "\r\n");
            }
            ctrl.toggle_btn("program_play", true, true);
            break;
        case "program_pause": 
            if ( !ctrl.machine_on || ctrl.machine_estop || ctrl.program_status == "idle" ) break;
            if ( ctrl.program_status == "running" ) ctrl.exec("set pause\r\n");
            else ctrl.exec("set resume\r\n");
            ctrl.toggle_btn("program_pause", true, true);
            break;
        case "program_abort": 
            if ( !ctrl.machine_on || ctrl.machine_estop ) break;
            ctrl.exec("set abort\r\n");
            ctrl.toggle_btn("program_abort", true, true);
            break;
        case "machine_estop": 
            if ( ctrl.machine_estop ) {
                ctrl.toggle_btn("machine_estop", false, true);
                ctrl.exec("set estop off\r\n");
            } else {
                ctrl.toggle_btn("machine_estop", true, true);
                ctrl.exec("set estop on\r\n");
            }
            break;
        case "machine_on": 
            if ( ctrl.machine_on || ctrl.machine_estop ) break;
            ctrl.toggle_btn("machine_on", true, true);
            ctrl.toggle_btn("machine_off", false);
            ctrl.exec("set machine on\r\n");
            break;
        case "machine_off": 
            if ( !ctrl.machine_on || ctrl.machine_estop ) break;
            ctrl.toggle_btn("machine_off", true, true);
            ctrl.toggle_btn("machine_on", false);
            ctrl.exec("set machine off\r\n");
            break;
    }
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

    // add event listener for buttons clicks
    document.querySelector("#control_panel").addEventListener("click", ctrl.btn_clicked);
}




window.addEventListener( "DOMContentLoaded", ctrl.js_init );
