// UTF8 without BOM

/*
    Position
*/

// settings vars and functions
var pos =
{
    db:         {},
    current:    {x:0, y:0, z:0, e:0}
};

// local strings to translate
var lng_local_dic =
[
    { en:"last, work", ru:"последние, рабочие" },
    { en:"real, work", ru:"текущие, рабочие" },
    { en:"last milestone", ru:"последнее значение" },
    { en:"real, machine", ru:"текущие, машинные" },
    { en:"last, machine", ru:"последние, машинные" },
    { en:"real, actuators", ru:"текущие, актуаторы" },
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




pos.update = function ( type )
{
    if ( !lcnc_available || pos.update.busy || !parent.location.protocol.match("http") ) return;

    pos.update.busy = true;
    pos.update.xhr = pos.update.xhr ? pos.update.xhr : new XMLHttpRequest();
    pos.update.xhr.open('POST', "/command", true);
    pos.update.xhr.onreadystatechange = pos.update.xhr.onreadystatechange ? 
        pos.update.xhr.onreadystatechange :
        function()
        {
            if ( this.readyState != 4 ) return;

            if ( this.status == 200 ) {
                var find;
                for ( var axis in pos.current ) {
                    find = new RegExp(axis+":\\s*([0-9\\.\\-]+)","i");
                    pos.current[axis] = this.responseText.match(find);
                    pos.current[axis] = pos.current[axis] ? pos.current[axis][1] : 0;
                    if ( !pos[axis+"_axis_value_focused"] ) {
                        document.querySelector("#"+axis+"_axis_value").value = pos.current[axis];
                    }
                }
            }
            else {
                if ( log && log.add && lcnc_available ) {
                    log.add("[POS] LinuxCNC isn't available ("+this.status+":"+this.statusText+")", "red");
                }
                lcnc_available = false;
            }

            pos.update.busy = false;
        }

    switch (type) {
        case "last_work":       pos.update.xhr.send("M114\n"); break;
        case "real_work":       pos.update.xhr.send("M114.1\n"); break;
        case "real_machine":    pos.update.xhr.send("M114.2\n"); break;
        case "real_actuators":  pos.update.xhr.send("M114.3\n"); break;
        case "last_milestone":  pos.update.xhr.send("M114.4\n"); break;
        case "last_machine":    pos.update.xhr.send("M114.5\n"); break;
        default:                pos.update.xhr.send("M114\n");
    }
}

pos.limits_update = function()
{
    if ( !lcnc_available || pos.limits_update.busy || !parent.location.protocol.match("http") ) return;

    pos.limits_update.busy = true;
    pos.limits_update.xhr = pos.limits_update.xhr ? pos.limits_update.xhr : new XMLHttpRequest();
    pos.limits_update.xhr.open('POST', "/command", true);
    pos.limits_update.xhr.onreadystatechange = pos.limits_update.xhr.onreadystatechange ? 
        pos.limits_update.xhr.onreadystatechange :
        function()
        {
            if ( this.readyState != 4 ) return;

            if ( this.status == 200 ) {
                var states = this.responseText.match( /(max|min)_[xyz]:\s*[01]/igm );
                for ( var s = 0, axis, type, state, element; s < states.length; s++ ) {
                    axis = states[s].match( /[xyz]:/i )[0].substr(0,1).toLowerCase();
                    type = states[s].match( /^(max|min)/i )[0].toLowerCase();
                    state = states[s].match( /[01]$/ )[0];
                    element = document.querySelector("#"+axis+"_axis_limit_"+type);
                    
                    if ( state == "1" && !element.classList.contains("limit_hit") ) {
                        element.classList.add("limit_hit");
                    } else if ( state == "0" && element.classList.contains("limit_hit") ) {
                        element.classList.remove("limit_hit");
                    }
                }
            }
            else {
                if ( log && log.add && lcnc_available ) {
                    log.add("[POS] LinuxCNC isn't available ("+this.status+":"+this.statusText+")", "red");
                }
                lcnc_available = false;
            }

            pos.limits_update.busy = false;
        }
    pos.limits_update.xhr.send("M119\n");
}




// here is a good place to send command text to the LinuxCNC controller
pos.execute_command = function ( outcmd )
{
    if ( !lcnc_available || !parent.location.protocol.match("http") ) return;

    var xhr = new XMLHttpRequest();
    xhr.open( "POST", "/command_silent", true );
    xhr.send( outcmd + "\n" );

    if ( log && log.add ) log.add("[POS] " + outcmd);
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
        pos.execute_command( "G92 " + this.id.match(/^[xyze]/i)[0].toUpperCase() + n(this.value) );
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
    pos.update_timer = setInterval( pos.update, 200, event.target.value );

    pos.db["pos.type"] = event.target.value;

    if ( log && log.add ) log.add("[POS] type = " + event.target.value);
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

    var axis = event.target.id.match(/^[xyze]/i)[0].toUpperCase();
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
    pos.limits_update_timer = setInterval( pos.limits_update, 3000 );

    // start position update process
    pos.update_timer = setInterval( pos.update, 200, pos.db["pos.type"] );
    
    // add focus/blur/keyup handlers to all inputs to catch a new input values
    // add click handlers to all axis reset buttons
    for ( var axis in pos.current ) {
        document.querySelector("#"+axis+"_axis_value").addEventListener("keyup", pos.on_input_keyup);
        document.querySelector("#"+axis+"_axis_value").addEventListener("focus", pos.on_input_focus);
        document.querySelector("#"+axis+"_axis_value").addEventListener("blur", pos.on_input_blur);
        document.querySelector("#"+axis+"_axis_reset").addEventListener("click", pos.on_axis_reset_click);
    }

    // catch position type changes
    document.querySelector("#pos_type_select").addEventListener("change", pos.on_pos_type_change);
}




window.addEventListener( "DOMContentLoaded", pos.js_init );
