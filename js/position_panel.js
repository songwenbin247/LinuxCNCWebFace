// UTF8 without BOM

/*
    Position
*/

// settings vars and functions
var pos =
{
    db: {},

    halsock:                false,
    halsock_open:           false,
    lcncsock:               false,
    lcncsock_open:          false,
    
    update_interval:                200,
    limits_update_interval:         500,
    coord_sys_update_interval:      500,
    homed_states_update_interval:   500,
    units_update_interval:          1000,
    
    program_linear_units:   "MM",
    program_angular_units:  "DEG",
    joint_units:            ["MM","MM","MM","DEG","DEG","DEG"],
    joint_type:             ["LINEAR","LINEAR","LINEAR","ANGULAR","ANGULAR","ANGULAR"]
};

// local strings to translate
var lng_local_dic =
[
    { en:"work, actual", ru:"рабочие, текущие" },
    { en:"machine, actual", ru:"машинные, текущие" },
    { en:"work, commanded", ru:"рабочие, последние" },
    { en:"machine, commanded", ru:"машинные, последние" },
    { en:"joints, absolute", ru:"моторы, абсолют" },
    { en:"Set", ru:"Выставить" },
    { en:"Click - Edit, ESC - Cancel, ENTER - Set", ru:"Клик - Изменить, ESC - Отмета, ENTER - Применить" },
    { en:"Coordinates type", ru:"Тип координат" },
    { en:"Coordinate System", ru:"Система координат" },
    { en:"limit (max) status", ru:"лимит (макс)" },
    { en:"limit (min) status", ru:"лимит (мин)" },
    { en:"Home", ru:"Дом для" },
    { en:"H", ru:"Д" },
    { en:"Display linear units", ru:"Отображаемые линейные единицы измерения" },
    { en:"Display angular units", ru:"Отображаемые угловые единицы измерения" },
    { en:"auto", ru:"авто" },
    { en:"millimeters", ru:"миллиметры" },
    { en:"centimeters", ru:"сантиметры" },
    { en:"inches", ru:"дюймы" },
    { en:"degrees", ru:"градусы" },
    { en:"radians", ru:"радианы" },
    { en:"gradians", ru:"грады" },
    { en:"none", ru:"отсутствуют" },
    { en:"custom", ru:"собственные" },
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
    pos.halsock.send("hello "+HALRMT_HELLO_PASSWORD+" poshal 1\r\n");
    // disable echo in answers
    pos.halsock.send(
        "set enable "+HALRMT_ENABLE_PASSWORD+"\r\n"+
        "set echo off\r\n"+
        "set enable off\r\n"
    );
    // check axis visibility
    setTimeout(
        function() {
            var msg = "";
            for ( var a = 0; a < AXES.length; a++ ) msg += "get pinval ini."+a+".max_acceleration\r\n";
            pos.halsock.send(msg);
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

            if ( params[0] >= 0 && params[0] < AXES.length ) {
                id      = AXES[params[0]]+"_axis_pos_box";
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
    pos.lcncsock.send("hello "+LINUXCNCRSH_HELLO_PASSWORD+" poslcnc 1\r\n");
    // disable echo in answers
    pos.lcncsock.send(
        "set enable "+LINUXCNCRSH_ENABLE_PASSWORD+"\r\n"+
        "set echo off\r\n"+
        "set enable off\r\n"
    );
}
pos.lcncsock_onmessage = function(e)
{
    var lines = e.data.match(/[^\r\n]+[\r\n]+/igm);

    for ( var n = 0; n < lines.length; n++ ) 
    {
        if ( lines[n].match(/^\s*\w+_pos/i) ) { // position values
            var params = lines[n].match(/[\-\.0-9]+/g);
            for ( var a = 0; a < AXES.length && params && params[a]; a++ ) {
                if ( !pos[AXES[a]+"_axis_value_focused"] ) {
                    document.querySelector("#"+AXES[a]+"_axis_value").value = params[a];
                }
            }
        } 
        else if ( lines[n].match(/^program_codes/i) ) { // program current G codes
            var coord_sys_code = lines[n].match(/G5[3-9](\.[1-3])?/i);
            document.querySelector("#pos_coord_sys_select").value = coord_sys_code[0].toUpperCase();
        } 
        else if ( lines[n].match(/^linear_unit_conversion/i) ) { // current linear units
            var units = lines[n].match(/^linear_unit_conversion\s+(auto|mm|cm|inch)/i);
            document.querySelector("#linear_units_select").value = units[1].toUpperCase();
        } 
        else if ( lines[n].match(/^angular_unit_conversion/i) ) { // current angular units
            var units = lines[n].match(/^angular_unit_conversion\s+(auto|deg|grad|rad)/i);
            document.querySelector("#angular_units_select").value = units[1].toUpperCase();
        } 
        else if ( lines[n].match(/^program_units/i) ) {
            var units = lines[n].match(/^program_units\s+(none|mm|cm|inch)/i);
            pos.program_linear_units = units[1].toUpperCase();
        } 
        else if ( lines[n].match(/^program_angular_units/i) ) {
            var units = lines[n].match(/^program_angular_units\s+(none|deg|grad|rad)/i);
            pos.program_angular_units = units[1].toUpperCase();
        } 
        else if ( lines[n].match(/^joint_type/i) ) {
            var params = lines[n].match(/(linear|angular|custom)/ig);
            for ( var a = 0; a < AXES.length && params && params[a]; a++ ) {
                pos.joint_type[a] = params[a].toUpperCase();
            }
        } 
        else if ( lines[n].match(/^joint_units/i) ) {
            var params = lines[n].match(/\ (grad|deg|rad|custom)/ig);
            for ( var a = 0; a < AXES.length && params && params[a]; a++ ) {
                pos.joint_type[a] = params[a].trim().toUpperCase();
            }
        } 
        else if ( lines[n].match(/^\s*joint_limit/i) ) { // limits values
            var params = lines[n].match(/(ok|minsoft|maxsoft|minhard|maxhard)/ig);
            for ( var a = 0, max, min; a < AXES.length && params && params[a]; a++ ) {
                min = document.querySelector("#"+AXES[a]+"_axis_limit_min");
                max = document.querySelector("#"+AXES[a]+"_axis_limit_max");
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
        else if ( lines[n].match(/^\s*joint_homed/i) ) { // homed states
            var params = lines[n].match(/(yes|no)/ig);
            for ( var a = 0, input; a < AXES.length && params && params[a]; a++ ) {
                input = document.querySelector("#"+AXES[a]+"_axis_value");
                switch ( params[a].toLowerCase() ) {
                    case "yes": input.classList.add("axis_homed"); break;
                    default:    input.classList.remove("axis_homed");
                }
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
    if ( !parent.location.protocol.match("http") ) return;
    if ( !pos.halsock_open ) {
        pos.halsock = websock.create(HALSOCK_URL, SOCK_PROTO, pos.halsock_onopen, pos.halsock_onmessage, pos.halsock_onclose);
    }
    if ( !pos.lcncsock_open ) {
        pos.lcncsock = websock.create(LCNCSOCK_URL, SOCK_PROTO, pos.lcncsock_onopen, pos.lcncsock_onmessage, pos.lcncsock_onclose);
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
pos.coord_sys_update = function()
{
    if ( !pos.lcncsock_open ) return;

    pos.lcncsock.send("get program_codes\r\n");
}
pos.homed_states_update = function()
{
    if ( !pos.lcncsock_open ) return;

    pos.lcncsock.send("get joint_homed\r\n");
}
pos.units_update = function()
{
    if ( !pos.lcncsock_open ) return;

    pos.lcncsock.send(
        "get linear_unit_conversion\r\n" +
        "get angular_unit_conversion\r\n" +
        "get program_units\r\n" +
        "get program_angular_units\r\n" +
        "get joint_type\r\n" +
        "get joint_units\r\n"
    );
}




pos.exec_mdi = function ( outcmd )
{
    if ( !pos.lcncsock_open ) return;

    pos.lcncsock.send(
        "set enable " + LINUXCNCRSH_ENABLE_PASSWORD + "\r\n" +
        "set mode mdi\r\n" + 
        "set mdi " + outcmd + "\r\n" +
        "set enable off\r\n"
    );

    log.add("[POS] " + outcmd);
}
pos.exec = function ( outcmd )
{
    if ( !pos.lcncsock_open ) {
        log.add("[POS] LCNC socket isn't available","red");
        return;
    }
    if ( outcmd.trim() == "" ) return;

    pos.lcncsock.send(
        "set enable " + LINUXCNCRSH_ENABLE_PASSWORD + "\r\n" +
        outcmd +
        "set enable off\r\n"
    );

    log.add("[POS] lcnc " + outcmd);
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

pos.on_coord_sys_change = function ( event )
{
    pos.exec_mdi(event.target.value);
}

pos.on_linear_units_change = function ( event )
{
    if ( !event.target.value.match(/^(auto|mm|cm|inch)/i) ) return;

    pos.exec("set linear_unit_conversion " + event.target.value.toLowerCase() + "\r\n");
}

pos.on_angular_units_change = function ( event )
{
    if ( !event.target.value.match(/^(auto|deg|rad|grad)/i) ) return;

    pos.exec("set angular_unit_conversion " + event.target.value.toLowerCase() + "\r\n");
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

pos.on_axis_home_click = function ( event )
{
    pos.simpleClickAnimation(event.target.id);
    pos.exec(
        "set mode manual\r\n" +
        "set home " + AXES.indexOf(event.target.id.match(/^[xyzabc]/i)[0]) + "\r\n"
    );
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
    // start coordinate system update process
    pos.coord_sys_update_timer = setInterval( pos.coord_sys_update, pos.coord_sys_update_interval );
    // start homed states update process
    pos.homed_states_update_timer = setInterval( pos.homed_states_update, pos.homed_states_update_interval );
    // start units update process
    pos.units_update_timer = setInterval( pos.units_update, pos.units_update_interval );
    
    // add focus/blur/keyup handlers to all inputs to catch a new input values
    // add click handlers to all axis reset buttons
    for ( var a = 0; a < AXES.length; a++ ) {
        document.querySelector("#"+AXES[a]+"_axis_value").addEventListener("keyup", pos.on_input_keyup);
        document.querySelector("#"+AXES[a]+"_axis_value").addEventListener("focus", pos.on_input_focus);
        document.querySelector("#"+AXES[a]+"_axis_value").addEventListener("blur", pos.on_input_blur);
        document.querySelector("#"+AXES[a]+"_axis_reset").addEventListener("click", pos.on_axis_reset_click);
        document.querySelector("#"+AXES[a]+"_axis_home").addEventListener("click", pos.on_axis_home_click);
    }

    // catch position type changes
    document.querySelector("#pos_type_select").addEventListener("change", pos.on_pos_type_change);
    // catch coordinate system changes
    document.querySelector("#pos_coord_sys_select").addEventListener("change", pos.on_coord_sys_change);
    // catch linear units changes
    document.querySelector("#linear_units_select").addEventListener("change", pos.on_linear_units_change);
    // catch angular units changes
    document.querySelector("#angular_units_select").addEventListener("change", pos.on_angular_units_change);

    // create sockets to talk with LCNC
    if ( parent.location.protocol.match("http") ) {
        pos.halsock = websock.create(HALSOCK_URL, SOCK_PROTO, pos.halsock_onopen, pos.halsock_onmessage, pos.halsock_onclose);
        pos.lcncsock = websock.create(LCNCSOCK_URL, SOCK_PROTO, pos.lcncsock_onopen, pos.lcncsock_onmessage, pos.lcncsock_onclose);
    }
    // create check timer for these sockets
    setInterval(pos.check_sockets, SOCK_CHECK_INTERVAL);
}




window.addEventListener( "DOMContentLoaded", pos.js_init );
