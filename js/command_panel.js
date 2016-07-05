// UTF8 without BOM

/*
    Command
*/

// settings vars and functions
var cmd =
{
    db: {},
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
    if ( !parent.location.protocol.match("http") ) return;

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




// do it when window is fully loaded
cmd.js_init = function()
{
    console.log("cmd.js_init()");

    document.querySelector("#command_text").addEventListener("keyup", cmd.on_cmd_input_keyup);
    document.querySelector("#command_send").addEventListener("click", cmd.on_cmd_send);
    
    // create a socket to talk with halrmt
    cmd.halsock = websock.create(
        "ws://"+parent.location.hostname+"/halrmt", // url
        "telnet", // protocol
        function(e) { // onopen callback
            if ( log && log.add ) log.add("[CMD] [HAL] Socket is open","green");
        },
        function(e) { // onmessage callback
            if ( log && log.add ) log.add("[CMD] [HAL] " + e.data);
        },
        function(e) { // onclose callback
            if ( log && log.add ) log.add("[CMD] [HAL] Socket was closed ("+e.code+":"+e.message+")","red");
            setTimeout(
                function() {
                    cmd.halsock = websock.create(
                        cmd.halsock.url,
                        cmd.halsock.protocol,
                        cmd.halsock.onopen,
                        cmd.halsock.onmessage,
                        cmd.halsock.onclose
                    );
                },
                2000
            );
        }
    );
    // create a socket to talk with linuxcncrsh
    cmd.lcncsock = websock.create(
        "ws://"+parent.location.hostname+"/linuxcncrsh", // url
        "telnet", // protocol
        function(e) { // onopen callback
            if ( log && log.add ) log.add("[CMD] [LCNC] Socket is open","green");
        },
        function(e) { // onmessage callback
            if ( log && log.add ) log.add("[CMD] [LCNC] " + e.data);
        },
        function(e) { // onclose callback
            if ( log && log.add ) log.add("[CMD] [LCNC] Socket was closed ("+e.code+":"+e.message+")","red");
            setTimeout(
                function() {
                    cmd.lcncsock = websock.create(
                        cmd.lcncsock.url,
                        cmd.lcncsock.protocol,
                        cmd.lcncsock.onopen,
                        cmd.lcncsock.onmessage,
                        cmd.lcncsock.onclose
                    );
                },
                2000
            );
        }
    );
}




window.addEventListener( "DOMContentLoaded", cmd.js_init );
