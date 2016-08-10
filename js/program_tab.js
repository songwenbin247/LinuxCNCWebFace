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
    { en:"Open file", ru:"Открыть файл" },
    { en:"Save file", ru:"Сохранить файл" },
    { en:"Upload files", ru:"Загрузка файлов" },
    { en:"Run program", ru:"Пуск программы" },
    { en:"Pause program", ru:"Пауза программы" },
    { en:"Run only current line", ru:"Выполнить только текущую строку" },
    { en:"Abort program", ru:"Стоп программы" },
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
prog.path_btn_clicked = function ( event )
{
    prog.simpleClickAnimation(event.target.id);
}

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




prog.tab_frame_load_end = function() 
{
    var text        = typeof(prog.text_node) == "undefined" ? document.querySelector("#program_text") : prog.text_node;
    var frame_doc   = text.contentDocument;
    var frame_path  = frame_doc.location.pathname.replace(/([^\/])\/+$/igm, "$1");
    var is_file     = frame_doc.querySelector("script") == null;
    var sub_paths   = frame_path.match(/\/[^\/]+/igm) || [];
    
    prog.current_file   = is_file ? frame_path : false;
    prog.current_dir    = is_file ? frame_path.replace(/\/[^\/]+$/im, "") : frame_path;

    if ( is_file ) {
        
    } else {
        sub_paths.unshift("/");

        var group = document.createElement("div"); 
        group.classList.add("icon_group");

        for ( var d = 0, elem; d < sub_paths.length; d++ ) {
            elem = document.createElement("div");
            elem.classList.add("icon","dir");
            elem.innerHTML = sub_paths[d]
                                .replace(/^\/+([^\/])/gm, "$1")
                                .replace(/&/gm, "&amp;")
                                .replace(/</gm, "&lt;")
                                .replace(/>/gm, "&gt;");
            elem.id = "path_part_"+d;
            elem.addEventListener("click", prog.path_btn_clicked);
            group.appendChild(elem);
        }

        var tools = document.querySelector("#program_tools");
        tools.innerHTML = "";
        tools.appendChild(group);
    }

    log.add("file: "+prog.current_file);
    log.add("dir: "+prog.current_dir);
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
//            document.querySelector("#program_tools").addEventListener("click", prog.btn_clicked );
//            document.querySelector("#program_text").addEventListener("click", prog.editor_update );
//            document.querySelector("#program_text").addEventListener("keyup", prog.editor_update );
            lng.update();
            document.querySelector("#program_text").addEventListener("load", prog.tab_frame_load_end );
        }
    );
}




window.addEventListener( "DOMContentLoaded", prog.js_init );
