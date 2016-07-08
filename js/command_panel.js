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
    sock_check_interval:    5000,
    
    historyMaxItems:        100
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
    log.add("[CMD] " + cmd_text);

    var hal = cmd_text.match(/^hal\s+/i) ? true : false;
    var mdi = !cmd_text.match(/^(lcnc|hal)\s+/i) ? true : false;
    var enable = mdi || cmd_text.match(/^(lcnc|hal)\s+set\s+/i) ? true : false;
    var outcmd = enable ? "set enable " + (hal ? halrmt_enable_password : linuxcncrsh_enable_password) + "\r\n" : "";
    
    outcmd += mdi ? "set mode mdi\r\nset mdi " : "";
    outcmd += cmd_text.replace(/^(hal|lcnc)\s+/i, "");
    outcmd += "\r\n";
    outcmd += enable ? "set enable off\r\n" : "";

    if ( hal ) {
        if ( cmd.halsock_open ) cmd.halsock.send(outcmd);
        else log.add("[CMD] HAL socket isn't available","red");
    } else {
        if ( cmd.lcncsock_open ) cmd.lcncsock.send(outcmd);
        else log.add("[CMD] LCNC socket isn't available","red");
    }
}

cmd.on_cmd_send = function()
{
    var cmd_text = document.querySelector("#command_text").value;
    if ( cmd_text.trim().length < 1 ) return;
    cmd.add2history(cmd_text);
    cmd.exec(cmd_text);
    cmd.clear_current_cmd();
}

cmd.on_cmd_input_keyup = function ( event )
{
    switch (event.keyCode) {
        case 13 :
            cmd.on_cmd_send();
            break;
        case 38 : // up
            cmd.historyBack();
            break;
        case 40 : // down
            cmd.historyForward();
            break;
        default :
            var cmd_text = document.querySelector("#command_text").value;
            if ( cmd_text == cmd.historyList[cmd.historyID] ) break;
            cmd.update_current_cmd(cmd_text);
    }
}




cmd.halsock_onopen = function(e)
{
    if ( !cmd.halsock_open ) log.add("[CMD] [HAL] Socket is open","green");
    cmd.halsock_open = true;
    // send hello with some passwords
    cmd.halsock.send("hello "+halrmt_hello_password+" cmdhal 1\r\n");
}
cmd.halsock_onmessage = function(e)
{
    if ( e.data.match(/^(hello|set enable)/i) ) return;
    log.add("[CMD] [HAL] " + e.data);
}
cmd.halsock_onclose = function(e)
{
    if ( cmd.halsock_open ) log.add("[CMD] [HAL] Socket is closed ("+e.code+":"+e.reason+")","red");
    cmd.halsock_open = false;
}

cmd.lcncsock_onopen = function(e)
{
    if ( !cmd.lcncsock_open ) log.add("[CMD] [LCNC] Socket is open","green");
    cmd.lcncsock_open = true;
    // send hello with some passwords
    cmd.lcncsock.send("hello "+linuxcncrsh_hello_password+" cmdlcnc 1\r\n");
}
cmd.lcncsock_onmessage = function(e)
{
    if ( e.data.match(/^(hello|set enable)/i) ) return;
    log.add("[CMD] [LCNC] " + e.data);
}
cmd.lcncsock_onclose = function(e)
{
    if ( cmd.lcncsock_open ) log.add("[CMD] [LCNC] Socket is closed ("+e.code+":"+e.reason+")","red");
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




cmd.get_history = function()
{
    if ( !cmd.db["cmd.history"] ) cmd.db["cmd.history"] = "";
    cmd.historyList = cmd.db["cmd.history"].split("\r\n");

    // cut the history
    var start = cmd.historyList.length - cmd.historyMaxItems;
    if ( start > 0 ) {
        cmd.historyList = cmd.historyList.slice(start, cmd.historyList.length);
        cmd.db["cmd.history"] = cmd.historyList.join("\r\n");
    }

    cmd.historyID = cmd.historyList.length;
    cmd.historyList[cmd.historyList.length] = "";
}
cmd.add2history = function ( cmd_text )
{
    if ( cmd.historyList.length > 1 && cmd.historyList[cmd.historyList.length - 2] == cmd_text ) return;
    cmd.historyList[cmd.historyList.length - 1] = cmd_text;
    cmd.historyID = cmd.historyList.length;
    cmd.historyList[cmd.historyID] = "";
    cmd.db["cmd.history"] += "\r\n" + cmd_text;
}
cmd.update_current_cmd = function ( cmd_text )
{
    cmd.historyList[cmd.historyList.length - 1] = cmd_text;
    cmd.historyID = cmd.historyList.length - 1;
}
cmd.historyBack = function()
{
    cmd.historyID--;
    if ( cmd.historyID < 0 ) cmd.historyID = 0;
    document.querySelector("#command_text").value = cmd.historyList[cmd.historyID];
}
cmd.historyForward = function()
{
    cmd.historyID++;
    if ( cmd.historyID >= cmd.historyList.length ) cmd.historyID = cmd.historyList.length - 1;
    document.querySelector("#command_text").value = cmd.historyList[cmd.historyID];
}
cmd.clear_current_cmd = function()
{
    document.querySelector("#command_text").value = "";
    cmd.update_current_cmd("");
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
    
    cmd.get_history();
}




window.addEventListener( "DOMContentLoaded", cmd.js_init );
