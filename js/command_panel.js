// UTF8 without BOM

/*
    Command
*/

// settings vars and functions
var cmd =
{
    db: {},

    halsock:                false,
    halsock_url:            "ws://"+parent.location.hostname+"/halrmt",
    halsock_open:           false,
    lcncsock:               false,
    lcncsock_url:           "ws://"+parent.location.hostname+"/linuxcncrsh",
    lcncsock_open:          false,
    sock_proto:             "telnet",
    sock_check_interval:    5000
};

// local strings to translate
var lng_local_dic =
[
    { en:"enter command here", ru:"введите команду" },
    { en:"SEND", ru:"ПУСК" },
];

// add local strings to translate to the global translate list
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];
lng.dic = lng.dic.concat(lng_local_dic);




// have we a localStorage?
if ( window.localStorage ) cmd.db = window.localStorage;




// send command text to the LinuxCNC controller
cmd.exec = function ( cmd_text )
{
    if ( log && log.add ) log.add("[CMD] " + cmd_text);

    if ( cmd_text.match(/^hal\s+/i) ) {
        if ( cmd.halsock ) {
            cmd.halsock.send( cmd_text.replace(/^hal\s+/i, "") + "\r\n" );
        } else {
            if ( log && log.add ) log.add("[CMD] HAL socket isn't available","red");
        }
    } else if ( cmd_text.match(/^lcnc\s+/i) ) {
        if ( cmd.lcncsock ) {
            cmd.lcncsock.send( cmd_text.replace(/^lcnc\s+/i, "") + "\r\n" );
        } else {
            if ( log && log.add ) log.add("[CMD] LCNC socket isn't available","red");
        }
    }
}

cmd.on_cmd_send = function()
{
    var cmd_text = document.querySelector("#command_text").value.trim();
    cmd.exec(cmd_text);
}

cmd.on_cmd_input_keyup = function ( event )
{
    if ( event.keyCode == 13 ) cmd.on_cmd_send();
}




cmd.halsock_onopen = function(e)
{
    if ( log && log.add && !cmd.halsock_open ) log.add("[CMD] [HAL] Socket is open","green");
    cmd.halsock_open = true;
    // send hello with some passwords
    cmd.halsock.send("hello EMC cmdhal 1\r\nset enable EMCTOO\r\n");
}
cmd.halsock_onmessage = function(e)
{
    if ( e.data.match(/^(hello|set enable)/i) ) return;
    if ( log && log.add ) log.add("[CMD] [HAL] " + e.data);
}
cmd.halsock_onclose = function(e)
{
    if ( log && log.add && cmd.halsock_open ) log.add("[CMD] [HAL] Socket is closed ("+e.code+":"+e.reason+")","red");
    cmd.halsock_open = false;
}

cmd.lcncsock_onopen = function(e)
{
    if ( log && log.add && !cmd.lcncsock_open ) log.add("[CMD] [LCNC] Socket is open","green");
    cmd.lcncsock_open = true;
    // send hello with some passwords
    cmd.lcncsock.send("hello EMC cmdlcnc 1\r\nset enable EMCTOO\r\n");
}
cmd.lcncsock_onmessage = function(e)
{
    if ( e.data.match(/^(hello|set enable)/i) ) return;
    if ( log && log.add ) log.add("[CMD] [LCNC] " + e.data);
}
cmd.lcncsock_onclose = function(e)
{
    if ( log && log.add && cmd.lcncsock_open ) log.add("[CMD] [LCNC] Socket is closed ("+e.code+":"+e.reason+")","red");
    cmd.lcncsock_open = false;
}

cmd.check_sockets = function()
{
    if ( !cmd.halsock_open ) {
        cmd.halsock = websock.create(cmd.halsock_url, cmd.sock_proto, cmd.halsock_onopen, cmd.halsock_onmessage, cmd.halsock_onclose);
    }
    if ( !cmd.lcncsock_open ) {
        cmd.lcncsock = websock.create(cmd.lcncsock_url, cmd.sock_proto, cmd.lcncsock_onopen, cmd.lcncsock_onmessage, cmd.lcncsock_onclose);
    }
}




// do it when window is fully loaded
cmd.js_init = function()
{
    console.log("cmd.js_init()");

    document.querySelector("#command_text").addEventListener("keyup", cmd.on_cmd_input_keyup);
    document.querySelector("#command_send").addEventListener("click", cmd.on_cmd_send);
    
    // create sockets to talk with LCNC
    cmd.halsock = websock.create(cmd.halsock_url, cmd.sock_proto, cmd.halsock_onopen, cmd.halsock_onmessage, cmd.halsock_onclose);
    cmd.lcncsock = websock.create(cmd.lcncsock_url, cmd.sock_proto, cmd.lcncsock_onopen, cmd.lcncsock_onmessage, cmd.lcncsock_onclose);

    // create check timer for these sockets
    setInterval(cmd.check_sockets, cmd.sock_check_interval);
}




window.addEventListener( "DOMContentLoaded", cmd.js_init );
