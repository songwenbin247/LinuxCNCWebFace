// UTF8 without BOM

/*
    Program Tab
*/

// settings vars and functions
var prog =
{
    db: {},
    
    current_line: 0,
};

// have we a localStorage?
if ( window.localStorage ) prog.db = window.localStorage;




prog.simpleClickAnimation = function ( id )
{
    document.querySelector("#"+id).style.opacity = "0";
    setTimeout( 'document.querySelector("#'+id+'").style.opacity = "1";', 200 );
}




// some of the move buttons was clicked
prog.btn_clicked = function ( event )
{
    var id;

    if ( /_(file|program)$/.test(event.target.id) ) id = event.target.id;
    else if ( /_(file|program)$/.test(event.target.parentElement.id) ) id = event.target.parentElement.id;
    else return;

    prog.simpleClickAnimation(id);

    switch (id) {
        case "open_file": 
            tabs.activate("explorer");
            log.add("[PROG] Opening files explorer");
            break;
        case "reload_file": 
            log.add("[PROG] Reload current file from the host PC");
            break;
        case "save_file": 
            log.add("[PROG] File saved");
            break;

        case "play_program": 
            log.add("[PROG] Run current program");
/*            if ( !ctrl.machine_on || ctrl.machine_estop || ctrl.program_status == "running" ) break;
            if ( ctrl.program_status == "paused" ) {
                ctrl.exec("set resume\r\n");
            } else {
                if ( typeof(prog) != "object" ) ctrl.exec("set mode auto\r\nset run\r\n");
                else ctrl.exec("set mode auto\r\nset run " + prog.current_line + "\r\n");
            }
*/            break;
        case "pause_program": 
            log.add("[PROG] Pause current program");
/*            if ( !ctrl.machine_on || ctrl.machine_estop || ctrl.program_status == "idle" ) break;
            if ( ctrl.program_status == "running" ) ctrl.exec("set pause\r\n");
            else ctrl.exec("set resume\r\n");
*/            break;
        case "step_program": 
            log.add("[PROG] Run one line of current program");
            break;
        case "abort_program": 
            log.add("[PROG] Abort current program");
/*            if ( !ctrl.machine_on || ctrl.machine_estop ) break;
            ctrl.exec("set abort\r\n");
*/            break;
    }
}




prog.editor_update = function(event)
{
    var text        = typeof(prog.text_node) == "undefined" ? document.querySelector("#program_text") : prog.text_node;
    var line        = typeof(prog.line_node) == "undefined" ? document.querySelector("#current_line") : prog.line_node;
    var position    = typeof(prog.position_node) == "undefined" ? document.querySelector("#current_pos") : prog.position_node;

    var current_pos     = text.selectionDirection == "forward" ? text.selectionStart : text.selectionEnd;
    var current_line    = (text.value.substr(0,current_pos).match(/\n/gm) || []).length + 1;

    prog.current_line = current_line;

    position.innerHTML  = "" + current_pos; 
    line.innerHTML      = "" + current_line; 
}




prog.editor_goto_line = function ( number, select )
{
    number      = Number(number).toFixed(0);
    var text    = typeof(prog.text_node) == "undefined" ? document.querySelector("#program_text") : prog.text_node;
    var lines   = text.value.match(/[^\n]*\n/gm);

    if ( !lines || number <= 1 ) {
        if ( select ) text.setSelectionRange(0, text.value.search(/(\n|$)/), "forward");
        return;
    } else if ( number > (lines.length + 1) ) {
        text.setSelectionRange( text.value.search(/\n[^\n]*$/) + 1, text.value.length, "forward" );
        text.scrollTop = text.scrollHeight;
        text.scrollLeft = 0;
        return;
    }

    var startPos = 0;
    for ( var n = 0, max = number - 1; n < max; n++ ) startPos += lines[n].length;
    
    var endPos = select ? startPos + lines[number - 1].length - 1 : startPos;
    var line_height = text.scrollHeight / (lines.length + 1);

    text.setSelectionRange(startPos, endPos, "forward");
    text.scrollTop = line_height * (number - 1) - text.clientHeight/2;
    text.scrollLeft = 0;
    
    prog.editor_update();
}




// do it when window is fully loaded
prog.js_init = function()
{
    console.log("prog.js_init()");

    if ( typeof(tabs) != "object" ) {
        log.add("[PROG] Tabs panel not found");
        return;
    }
    
    // create TMP element
    prog.tab_content = document.createElement("div");
    prog.tab_content.style.display = "none";
    document.querySelector("body").appendChild(prog.tab_content);
    
    // and load into it tab's content
    loadto("web_files/module/program_tab/html/program_tab.html", "a", prog.tab_content, 
        function() {
            prog.tab = tabs.add("&#x2009;Program&#x2009;", prog.tab_content.innerHTML, "program,file,editor", 0, true);
            document.querySelector("body").removeChild(prog.tab_content);
            // catch btns clicks
            document.querySelector("#program_tools").addEventListener("click", prog.btn_clicked );
//            document.querySelector("#program_text").addEventListener("click", prog.editor_update );
//            document.querySelector("#program_text").addEventListener("keyup", prog.editor_update );
            lng.update();
        }
    );
}




window.addEventListener( "DOMContentLoaded", prog.js_init );
