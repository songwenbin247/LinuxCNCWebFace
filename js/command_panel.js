// UTF8 without BOM

/*
    Command
*/

// settings vars and functions
var cmd =
{
    db: {},

    halsock:                false,
    halsock_open:           false,
    lcncsock:               false,
    lcncsock_open:          false,
    
    historyMaxItems:        100
};

// have we a localStorage?
if ( window.localStorage ) cmd.db = window.localStorage;




// send command text to the LinuxCNC controller
cmd.exec = function ( cmd_text )
{
    log.add("[CMD] " + cmd_text);

    var hal = cmd_text.match(/^hal\s+/i) ? true : false;
    var mdi = !cmd_text.match(/^(lcnc|hal)\s+/i) ? true : false;
    var enable = mdi || cmd_text.match(/^(lcnc|hal)\s+set\s+/i) ? true : false;
    var outcmd = enable ? "set enable " + (hal ? HALRMT_ENABLE_PASSWORD : LINUXCNCRSH_ENABLE_PASSWORD) + "\r\n" : "";
    
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
    cmd.halsock.send("hello "+HALRMT_HELLO_PASSWORD+" cmdhal 1\r\n");
    // disable echo in answers
    cmd.halsock.send(
        "set enable "+HALRMT_ENABLE_PASSWORD+"\r\n"+
        "set echo off\r\n"+
        "set enable off\r\n"
    );
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
    cmd.lcncsock.send("hello "+LINUXCNCRSH_HELLO_PASSWORD+" cmdlcnc 1\r\n");
    // disable echo in answers
    cmd.lcncsock.send(
        "set enable "+LINUXCNCRSH_ENABLE_PASSWORD+"\r\n"+
        "set echo off\r\n"+
        "set enable off\r\n"
    );
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
    if ( !parent.location.protocol.match("http") ) return;
    if ( !cmd.halsock_open ) {
        cmd.halsock = websock.create(HALSOCK_URL, SOCK_PROTO, cmd.halsock_onopen, cmd.halsock_onmessage, cmd.halsock_onclose);
    }
    if ( !cmd.lcncsock_open ) {
        cmd.lcncsock = websock.create(LCNCSOCK_URL, SOCK_PROTO, cmd.lcncsock_onopen, cmd.lcncsock_onmessage, cmd.lcncsock_onclose);
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
    if ( parent.location.protocol.match("http") ) {
        cmd.halsock = websock.create(HALSOCK_URL, SOCK_PROTO, cmd.halsock_onopen, cmd.halsock_onmessage, cmd.halsock_onclose);
        cmd.lcncsock = websock.create(LCNCSOCK_URL, SOCK_PROTO, cmd.lcncsock_onopen, cmd.lcncsock_onmessage, cmd.lcncsock_onclose);
    }

    // create check timer for these sockets
    setInterval(cmd.check_sockets, SOCK_CHECK_INTERVAL);
    
    cmd.get_history();

    // add panel settings to the Settings tab
    if ( typeof(tabs) == "object" && typeof(set) == "object" ) {
        // create TMP element
        cmd.tmp_settings_block = document.createElement("div");
        cmd.tmp_settings_block.style.display = "none";
        document.querySelector("body").appendChild(cmd.tmp_settings_block);

        loadto("html/cmd_settings_block.html", "a", cmd.tmp_settings_block, 
            function() {
                cmd.settings_block = set.add("&#x2009;Command (MDI) panel&#x2009;", cmd.tmp_settings_block.innerHTML);
                document.querySelector("body").removeChild(cmd.tmp_settings_block);
                lng.update();
            }
        );
    }
}




window.addEventListener( "DOMContentLoaded", cmd.js_init );
