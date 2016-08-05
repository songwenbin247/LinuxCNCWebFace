// UTF8 without BOM

/*
    Program Tab
*/

// settings vars and functions
var prog =
{
    db: {},
    
    current_line: 0,
    current_file: false,
    current_dir: false
};

// local strings to translate
var lng_local_dic =
[
    { en:"Program", ru:"Программа" },
    { en:"OPEN", ru:"ОТКРЫТЬ" },
    { en:"SAVE", ru:"СОХРАНИТЬ" },
    { en:"UPLOAD", ru:"ЗАГРУЗКА" },
    { en:"RUN", ru:"ПУСК" },
    { en:"PAUSE", ru:"ПАУЗА" },
    { en:"STEP", ru:"ШАГ" },
    { en:"ABORT", ru:"СТОП" },
    { en:"Current line", ru:"Текущая строка" },
    { en:"Current text position", ru:"Текущая позиция в тексте" },
];

// add local strings to translate to the global translate list
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];
lng.dic = lng.dic.concat(lng_local_dic);




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
            log.add("[PROG] Open file on the host PC");
            break;
        case "save_file": 
            log.add("[PROG] File saved");
            break;
        case "upload_file": 
            log.add("[PROG] Upload file to the host PC");
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
    loadto("html/program_tab.html", "a", prog.tab_content, 
        function() {
            prog.tab = tabs.add("&#x2009;Program&#x2009;", prog.tab_content.innerHTML, 0, true);
            document.querySelector("body").removeChild(prog.tab_content);
            // catch btns clicks
            document.querySelector("#program_tools").addEventListener("click", prog.btn_clicked );
            document.querySelector("#program_text").addEventListener("click", prog.editor_update );
            document.querySelector("#program_text").addEventListener("keyup", prog.editor_update );
            lng.update();
        }
    );
}




window.addEventListener( "DOMContentLoaded", prog.js_init );
