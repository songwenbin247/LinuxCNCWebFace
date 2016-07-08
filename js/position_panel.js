// UTF8 without BOM

/*
    Position
*/

// settings vars and functions
var pos =
{
    db: {},

    lcncsock:               false,
    lcncsock_url:           "ws://"+parent.location.hostname+"/linuxcncrsh",
    lcncsock_open:          false,
    sock_proto:             "telnet",
    sock_check_interval:    5000,
    
    update_interval:        200,
    limits_update_interval: 500,

    axes: ["x","y","z","a","b","c"]
};

// local strings to translate
var lng_local_dic =
[
    { en:"work, actual", ru:"рабочие, текущие" },
    { en:"machine, actual", ru:"машинные, текущие" },
    { en:"work, commanded", ru:"рабочие, последние" },
    { en:"machine, commanded", ru:"мащинные, последние" },
    { en:"Set", ru:"Выставить" },
    { en:"Click - Edit, ESC - Cancel, ENTER - Set", ru:"Клик - Изменить, ESC - Отмета, ENTER - Применить" },
    { en:"Coordinates type", ru:"Тип координат" },
    { en:"endstop (max) status", ru:"концевик (макс)" },
    { en:"endstop (min) status", ru:"концевик (мин)" },
];

// add local strings to translate to the global translate list
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];
lng.dic = lng.dic.concat(lng_local_dic);




// have we a localStorage?
if ( window.localStorage ) pos.db = window.localStorage;




pos.lcncsock_onopen = function(e)
{
    if ( !pos.lcncsock_open ) log.add("[POS] [LCNC] Socket is open","green");
    pos.lcncsock_open = true;
    // send hello with some passwords
    pos.lcncsock.send("hello "+linuxcncrsh_hello_password+" poslcnc 1\r\nset enable "+linuxcncrsh_enable_password+"\r\n");
}
pos.lcncsock_onmessage = function(e)
{
    if ( e.data.match(/^\s*\w+_pos/i) ) { // position values
        var params = e.data.match(/[\-\.0-9]+/g);
        for ( var a = 0; a < pos.axes.length && params && params[a]; a++ ) {
            document.querySelector("#"+pos.axes[a]+"_axis_value").value = params[a];
        }
    } else if ( e.data.match(/^\s*joint_limit/i) ) { // limits values
        var params = e.data.match(/(ok|minsoft|maxsoft|minhard|maxhard)/ig);
        for ( var a = 0, max, min; a < pos.axes.length && params && params[a]; a++ ) {
            min = document.querySelector("#"+pos.axes[a]+"_axis_limit_min");
            max = document.querySelector("#"+pos.axes[a]+"_axis_limit_max");
            switch ( params[a].toLowerCase() ) {
                case "ok":
                    min.classList.remove("limit_hard","limit_soft");
                    max.classList.remove("limit_hard","limit_soft");
                    break;
                case "minsoft":
                    max.classList.remove("limit_hard","limit_soft");
                    min.classList.remove("limit_hard");
                    min.classList.add("limit_soft");
                    break;
                case "minhard":
                    max.classList.remove("limit_hard","limit_soft");
                    min.classList.remove("limit_soft");
                    min.classList.add("limit_hard");
                    break;
                case "maxsoft":
                    min.classList.remove("limit_hard","limit_soft");
                    max.classList.remove("limit_hard");
                    max.classList.add("limit_soft");
                    break;
                case "maxhard":
                    min.classList.remove("limit_hard","limit_soft");
                    max.classList.remove("limit_soft");
                    max.classList.add("limit_hard");
                    break;
            }
        }
    }
}
pos.lcncsock_onclose = function(e)
{
    if ( pos.lcncsock_open ) log.add("[POS] [LCNC] Socket is closed ("+e.code+":"+e.reason+")","red");
    pos.lcncsock_open = false;
}

pos.check_sockets = function()
{
    if ( !pos.lcncsock_open ) {
        pos.lcncsock = websock.create(pos.lcncsock_url, pos.sock_proto, pos.lcncsock_onopen, pos.lcncsock_onmessage, pos.lcncsock_onclose);
    }
}




pos.update = function ( coords_type )
{
    if ( !pos.lcncsock_open ) return;

    switch (coords_type) {
        case "commanded_absolute_pos":  pos.lcncsock.send("get abs_cmd_pos\r\n"); break;
        case "commanded_relative_pos":  pos.lcncsock.send("get rel_cmd_pos\r\n"); break;
        case "actual_absolute_pos":     pos.lcncsock.send("get abs_act_pos\r\n"); break;
        default:                        pos.lcncsock.send("get rel_act_pos\r\n"); // actual_relative_pos
    }
}
pos.limits_update = function()
{
    if ( !pos.lcncsock_open ) return;

    pos.lcncsock.send("get joint_limit\r\n");
}




// here is a good place to send command text to the LinuxCNC controller
pos.execute_command = function ( outcmd )
{
    if ( !lcnc_available || !parent.location.protocol.match("http") ) return;

    var xhr = new XMLHttpRequest();
    xhr.open( "POST", "/command_silent", true );
    xhr.send( outcmd + "\n" );

    log.add("[POS] " + outcmd);
}




// catch new values on input keyup and do something with it
pos.on_input_keyup = function ( event )
{
    // if ESC key pressed - just blur an input field
    if ( event.keyCode == 27 ) {
        this.blur();
        return;
    }

    // if ENTER key pressed
    if ( event.keyCode == 13 ) {
        pos.execute_command( "G92 " + this.id.match(/^[xyzabc]/i)[0].toUpperCase() + n(this.value) );
        this.blur();
    }
}




// catch and save input field focus state
pos.on_input_focus = function ( event )
{
    pos[event.target.id+"_focused"] = true;
}
pos.on_input_blur = function ( event )
{
    pos[event.target.id+"_focused"] = false;
}




pos.on_pos_type_change = function ( event )
{
    clearInterval(pos.update_timer);
    pos.update_timer = setInterval( pos.update, pos.update_interval, event.target.value );

    pos.db["pos.type"] = event.target.value;

    log.add("[POS] type = " + event.target.value);
}




// simple click animation
pos.simpleClickAnimation = function ( id )
{
    document.querySelector("#"+id).style.opacity = "0";
    setTimeout( 'document.querySelector("#'+id+'").style.opacity = "1";', 200 );
}




pos.on_axis_reset_click = function ( event )
{
    pos.simpleClickAnimation(event.target.id);

    var axis = event.target.id.match(/^[xyzabc]/i)[0].toUpperCase();
    pos.execute_command("G92 " + axis + "0");
}




// do it when window is fully loaded
pos.js_init = function()
{
    console.log("pos.js_init()");
    
    // set position type
    if ( !pos.db["pos.type"] ) pos.db["pos.type"] = "last_work";
    
    // update position type selector
    var select_children = document.querySelector("#pos_type_select").children;
    for ( var c = 0; c < select_children.length; c++ ) {
        if ( select_children[c].value == pos.db["pos.type"] ) {
            select_children[c].selected = "selected";
            break; 
        }
    }

    // start limits update process
    pos.limits_update_timer = setInterval( pos.limits_update, pos.limits_update_interval );

    // start position update process
    pos.update_timer = setInterval( pos.update, pos.update_interval, pos.db["pos.type"] );
    
    // add focus/blur/keyup handlers to all inputs to catch a new input values
    // add click handlers to all axis reset buttons
    for ( var a = 0; a < pos.axes.length; a++ ) {
        document.querySelector("#"+pos.axes[a]+"_axis_value").addEventListener("keyup", pos.on_input_keyup);
        document.querySelector("#"+pos.axes[a]+"_axis_value").addEventListener("focus", pos.on_input_focus);
        document.querySelector("#"+pos.axes[a]+"_axis_value").addEventListener("blur", pos.on_input_blur);
        document.querySelector("#"+pos.axes[a]+"_axis_reset").addEventListener("click", pos.on_axis_reset_click);
    }

    // catch position type changes
    document.querySelector("#pos_type_select").addEventListener("change", pos.on_pos_type_change);

    // create sockets to talk with LCNC
    pos.lcncsock = websock.create(pos.lcncsock_url, pos.sock_proto, pos.lcncsock_onopen, pos.lcncsock_onmessage, pos.lcncsock_onclose);
    // create check timer for these sockets
    setInterval(pos.check_sockets, pos.sock_check_interval);
}




window.addEventListener( "DOMContentLoaded", pos.js_init );
