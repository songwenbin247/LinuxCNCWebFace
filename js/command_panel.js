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
        if ( hal_available ) {
            websock.hal.sock.send( cmd_text.replace(/^hal\s+/i, "") + "\r\n" );
        } else {
            if ( log && log.add ) log.add("[CMD] HAL isn't available","red");
        }
    } else if ( cmd_text.match(/^lcnc\s+/i) ) {
        if ( lcnc_available ) {
            websock.lcnc.sock.send( cmd_text.replace(/^lcnc\s+/i, "") + "\r\n" );
        } else {
            if ( log && log.add ) log.add("[CMD] LCNC isn't available","red");
        }
    }
}

cmd.on_cmd_send = function()
{
    var cmd_text = document.querySelector("#command_text").value.trim().replace(/;\s*/igm,"\r\n");
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
}




window.addEventListener( "DOMContentLoaded", cmd.js_init );
