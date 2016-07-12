// UTF8 without BOM

/*
    Position
*/

// settings vars and functions
var pos =
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
    { en:"machine, commanded", ru:"машинные, последние" },
    { en:"joints, absolute", ru:"актуаторы, абсолютные" },
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




pos.halsock_onopen = function(e)
{
    if ( !pos.halsock_open ) log.add("[POS] [HAL] Socket is open","green");
    pos.halsock_open = true;
    // send hello with some passwords
    pos.halsock.send("hello "+halrmt_hello_password+" poshal 1\r\n");
    // disable echo in answers
    pos.halsock.send(
        "set enable "+halrmt_enable_password+"\r\n"+
        "set echo off\r\n"+
        "set enable off\r\n"
    );
    // check axis visibility
    setTimeout(
        function() {
            for ( var a = 0; a < pos.axes.length; a++ )
                pos.halsock.send("get pinval ini."+a+".max_acceleration\r\n");
        },
        200
    );
}

pos.halsock_onmessage = function(e)
{
    if ( e.data.match(/^PINVAL/i) ) {
        var strings = e.data.match(/PINVAL[\ \t]+ini\.[0-9]+\.max_acceleration[\ \t]+[\-\.0-9]+/igm);
        for ( var s = 0, params, hide, id, elem; s < strings.length; s++ ) {
            params      = strings[s].match(/\-?[0-9](\.?[0-9]+)?/g);
            params[0]   = n(params[0]);
            hide        = false;

            if ( n(params[1]) <= 0 ) hide = true;

            if ( params[0] >= 0 && params[0] < pos.axes.length ) {
                id      = pos.axes[params[0]]+"_axis_pos_box";
                elem    = document.querySelector("#"+id);
                if ( hide && elem.style.display != "none" ) pos.simpleHideAnimation(id);
                else if ( !hide && elem.style.display == "none" ) pos.simpleShowAnimation(id);
            }
        }
    }
}
pos.halsock_onclose = function(e)
{
    if ( pos.halsock_open ) log.add("[POS] [HAL] Socket is closed ("+e.code+":"+e.reason+")","red");
    pos.halsock_open = false;
}

pos.lcncsock_onopen = function(e)
{
    if ( !pos.lcncsock_open ) log.add("[POS] [LCNC] Socket is open","green");
    pos.lcncsock_open = true;
    // send hello with some passwords
    pos.lcncsock.send("hello "+linuxcncrsh_hello_password+" poslcnc 1\r\n");
    // disable echo in answers
    pos.lcncsock.send(
        "set enable "+linuxcncrsh_enable_password+"\r\n"+
        "set echo off\r\n"+
        "set enable off\r\n"
    );
}
pos.lcncsock_onmessage = function(e)
{
    if ( e.data.match(/^\s*\w+_pos/i) ) { // position values
        var params = e.data.match(/[\-\.0-9]+/g);
        for ( var a = 0; a < pos.axes.length && params && params[a]; a++ ) {
            if ( !pos[pos.axes[a]+"_axis_value_focused"] ) {
                document.querySelector("#"+pos.axes[a]+"_axis_value").value = params[a];
            }
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
    if ( !pos.halsock_open ) {
        pos.halsock = websock.create(pos.halsock_url, pos.sock_proto, pos.halsock_onopen, pos.halsock_onmessage, pos.halsock_onclose);
    }
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
        case "joints_absolute_pos":     pos.lcncsock.send("get joint_pos\r\n"); break;
        default:                        pos.lcncsock.send("get rel_act_pos\r\n"); // actual_relative_pos
    }
}
pos.limits_update = function()
{
    if ( !pos.lcncsock_open ) return;

    pos.lcncsock.send("get joint_limit\r\n");
}




pos.exec_mdi = function ( outcmd )
{
    if ( !pos.lcncsock_open ) return;

    pos.lcncsock.send(
        "set enable " + linuxcncrsh_enable_password + "\r\n" +
        "set mode mdi\r\n" + 
        "set mdi " + outcmd + "\r\n" +
        "set enable off\r\n"
    );

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
        pos.exec_mdi("G92 " + this.id.match(/^[xyzabc]/i)[0].toUpperCase() + n(this.value));
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

// simple toggle animations
pos.simpleHideAnimation = function ( id, elemType )
{
    var delay = Math.ceil(Math.random()*2000) + 500;
    var elem = document.querySelector("#"+id);

    elem.style.transition = "all "+delay+"ms linear";
    elem.style.opacity = "0";
    setTimeout( 'document.querySelector("#'+id+'").style.display = "none";', delay );
}
pos.simpleShowAnimation = function ( id, elemType )
{
    document.querySelector("#"+id).style.display = elemType ? elemType : "block";
}




pos.on_axis_reset_click = function ( event )
{
    pos.simpleClickAnimation(event.target.id);
    pos.exec_mdi("G92 " + event.target.id.match(/^[xyzabc]/i)[0].toUpperCase() + "0");
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
    pos.halsock = websock.create(pos.halsock_url, pos.sock_proto, pos.halsock_onopen, pos.halsock_onmessage, pos.halsock_onclose);
    pos.lcncsock = websock.create(pos.lcncsock_url, pos.sock_proto, pos.lcncsock_onopen, pos.lcncsock_onmessage, pos.lcncsock_onclose);
    // create check timer for these sockets
    setInterval(pos.check_sockets, pos.sock_check_interval);
}




window.addEventListener( "DOMContentLoaded", pos.js_init );
