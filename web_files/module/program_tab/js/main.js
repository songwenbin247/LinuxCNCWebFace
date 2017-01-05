// UTF8 without BOM

/*
    Program Tab
*/

// settings vars and functions
var prog =
{
    db: {},
    
    module_dir: "web_files/module/program_tab/",
    
    file: "",
    file_pages_count: 0,
    file_lines_count: 0,
    current_line: 0,
    
    page_lines: 1000,
    syntax_highlight: true,
    
    last_scroll_pos: 0,
    max_scroll_offset: 2000
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
            if ( prog.file ) prog.load_file(prog.file);
            else log.add("[PROG] Nothing to reload");
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




prog.on_scroll = function ( event )
{
    // when scroll bar almost at the top
    if ( 
        prog.last_scroll_pos >= prog.max_scroll_offset && 
        this.scrollTop < prog.max_scroll_offset 
    ) {
        var top_page_id = prog.top_visible_page_id();
        if ( top_page_id > 0 ) 
        {
            var prev_page_id = top_page_id - 1;
            if ( prog.page_loaded(prev_page_id) ) 
            {
                prog.show_page(prev_page_id);
                this.scrollTop += prog.text_box.querySelector("#program_text_page_"+prev_page_id).clientHeight;
            }
            else prog.load_page(prev_page_id);

            var bottom_page_id = prog.bottom_visible_page_id();
            if ( (bottom_page_id - top_page_id) > 1 ) prog.hide_page(bottom_page_id);
        }
    } 
    // when scroll bar almost at the bottom
    else if ( 
        prog.last_scroll_pos <= (this.scrollHeight - prog.max_scroll_offset) &&
        this.scrollTop > (this.scrollHeight - prog.max_scroll_offset) 
    ) {
        var bottom_page_id = prog.bottom_visible_page_id();
        if ( bottom_page_id < (prog.file_pages_count - 1) ) 
        {
            var post_page_id = bottom_page_id + 1;
            if ( prog.page_loaded(post_page_id) ) 
            {
                prog.show_page(post_page_id);
                this.scrollTop -= prog.text_box.querySelector("#program_text_page_"+post_page_id).clientHeight;
            }
            else prog.load_page(post_page_id);

            var top_page_id = prog.top_visible_page_id();
            if ( (bottom_page_id - top_page_id) > 1 ) prog.hide_page(top_page_id);
        }
    }
    
    prog.last_scroll_pos = this.scrollTop;
}




prog.top_visible_page_id = function ( )
{
    var page = prog.text_box.querySelector(".page:not(.hidden)");
    return ( page ) ? n(page.getAttribute("data-page_id")) : 0;
}
prog.bottom_visible_page_id = function ( )
{
    var pages = prog.text_box.querySelectorAll(".page:not(.hidden)");
    return ( pages ) ? n(pages[pages.length - 1].getAttribute("data-page_id")) : 0;
}

prog.page_loaded = function ( page_id )
{
    var page = prog.text_box.querySelector("#program_text_page_"+page_id);
    return ( page ) ? true : false;
}
prog.page_visible = function ( page_id )
{
    var page = prog.text_box.querySelector("#program_text_page_"+page_id+":not(.hidden)");
    return ( page ) ? true : false;
}

prog.load_file = function ( file_path )
{
    // reset file data
    prog.text_box.innerHTML = "";
    prog.file               = file_path;
    prog.file_lines_count   = 0;
    prog.current_line       = 0;
    prog.file_pages_count   = 0;

    // get file lines count
    var tmp = document.createElement("DIV");
    tmp.style.display = "none";
    document.querySelector('body').appendChild(tmp);
    prog.lines_count_tmp_element = tmp;
    loadto(
        prog.module_dir+"php/get_file_lines.php?file="+prog.file+"&count=1", 
        "a", 
        tmp,
        function() {
            prog.file_lines_count = n(prog.lines_count_tmp_element.innerHTML);
            prog.file_pages_count = Math.ceil(prog.file_lines_count / prog.page_lines);
            document.querySelector('body').removeChild(prog.lines_count_tmp_element);
            delete prog.lines_count_tmp_element;
        }
    );

    // load 1st page of this file
    var page_loaded = prog.load_page(0);
    if ( page_loaded ) log.add("[PROG] File `"+prog.file+"` loaded");
    return page_loaded;
}
prog.load_page = function ( page_id )
{
    if ( !prog.file || page_id < 0 ) return false;
    if ( prog.file_pages_count && page_id >= prog.file_pages_count ) return false;
    if ( prog.page_loaded(page_id) ) return false;
    
    var page = document.createElement("DIV");

    page.className = "page";
    page.id = "program_text_page_" + page_id;
    page.setAttribute("data-page_id", page_id);
    page.setAttribute("data-start_line", page_id * prog.page_lines);

    // if it's last page, add a hard space to the end. It needs for visibility of last empty line
    if ( page_id == (prog.file_pages_count - 1) ) page.innerHTML = "&nbsp;";

    var pages = prog.text_box.querySelectorAll(".page");
    if ( pages && pages.length > 0 ) {
        if ( pages[pages.length - 1].getAttribute("data-page_id") < page_id ) {
            prog.text_box.appendChild(page);
        } else {
            for ( var p = pages.length - 1; p >= 0; p-- ) {
                if ( pages[p].getAttribute("data-page_id") < page_id ) {
                    prog.text_box.insertBefore( page, pages[p + 1] );
                    break;
                }
            }
        }
    } 
    else prog.text_box.appendChild(page);

    loadto(
        prog.module_dir+
            "php/get_file_lines.php?file="+prog.file+
            "&start="+(page_id * prog.page_lines)+
            "&count="+prog.page_lines, 
        "p", 
        page
    );
    
    return true;
}
prog.remove_page = function ( page_id )
{
    var page = prog.text_box.querySelector("#program_text_page_"+page_id);
    if ( page )
    {
        prog.text_box.removeChild(page);
        return true;
    }
    return false;
}

prog.show_page = function ( page_id )
{
    var page = prog.text_box.querySelector("#program_text_page_"+page_id);
    if ( page ) 
    {
        page.classList.remove("hidden");
        return true;
    }
    return false;
}
prog.hide_page = function ( page_id )
{
    var page = prog.text_box.querySelector("#program_text_page_"+page_id);
    if ( page )
    {
        page.classList.add("hidden");
        return true;
    }
    return false;
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
    loadto(prog.module_dir+"/html/program_tab.html", "a", prog.tab_content, 
        function() {
            prog.tab = tabs.add("&#x2009;Program&#x2009;", prog.tab_content.innerHTML, "program,file,editor", 0, true);
            document.querySelector("body").removeChild(prog.tab_content);
            delete prog.tab_content;
            // catch btns clicks
            document.querySelector("#program_tools").addEventListener("click", prog.btn_clicked );
            document.querySelector("#program_text").addEventListener("scroll", prog.on_scroll );
//            document.querySelector("#program_text").addEventListener("click", prog.editor_update );
//            document.querySelector("#program_text").addEventListener("keyup", prog.editor_update );
            prog.text_box = document.querySelector("#program_text");
            lng.update();
        }
    );
}




window.addEventListener( "DOMContentLoaded", prog.js_init );
