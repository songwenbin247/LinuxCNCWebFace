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




// send command text to the smoothie controller
cmd.exec = function ( cmd_text )
{
    if ( !smoothie_available || !parent.location.protocol.match("http") ) return;

    var xhr = new XMLHttpRequest();
    xhr.open( "POST", "/command", true );
    xhr.cmd_text = cmd_text;
    xhr.onreadystatechange = function()
    {
        if ( this.readyState != 4 ) return;
        if ( log && log.add ) log.add("[CMD] " + this.cmd_text);
        if ( this.status == 200 ) {
            var answer = this.responseText.trim();
            if ( answer.match(/[\r\n]+/m) ) answer = "<br />" + answer.replace(/[\r\n]+/gm, "<br />");
            if ( log && log.add ) log.add("[SMOOTHIE] " + answer);
        } else {
            if ( log && log.add && smoothie_available ) {
                log.add("[CMD] Smoothie isn't available ("+this.status+":"+this.statusText+")", "red");
            }
            smoothie_available = false;
        }
    }
    xhr.send( cmd_text + "\n" );
}

cmd.on_cmd_send = function()
{
    var cmd_text = document.querySelector("#command_text").value.trim();

    if ( cmd_text.match(/[a-z][0-9]/im) ) cmd_text = cmd_text.toUpperCase();
    
    cmd_text = cmd_text.replace(/;\s*/igm,"\n");

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
