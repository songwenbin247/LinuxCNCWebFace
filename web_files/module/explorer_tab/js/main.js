// UTF8 without BOM

/*
    Files explorer Tab
*/

// settings vars and functions
var expl =
{
    db: {},
    
    current_file: false,
    current_dir: false
};

// have we a localStorage?
if ( window.localStorage ) expl.db = window.localStorage;




expl.simpleClickAnimation = function ( id )
{
    document.querySelector("#"+id).style.opacity = "0";
    setTimeout( 'document.querySelector("#'+id+'").style.opacity = "1";', 200 );
}




// some of the move buttons was clicked
expl.path_btn_clicked = function ( event )
{
    var id = event.target.id;
    expl.simpleClickAnimation(id);
    
    var path = event.target.getAttribute("data-path");
    var frame = document.querySelector("#explorer");
    
    frame.src = path;
}

expl.btn_clicked = function ( event )
{
    var id;

    if ( /_(file|program)$/.test(event.target.id) ) id = event.target.id;
    else if ( /_(file|program)$/.test(event.target.parentElement.id) ) id = event.target.parentElement.id;
    else return;

    expl.simpleClickAnimation(id);

    switch (id) {
        case "upload_file": 
            log.add("[PROG] Upload file to the host PC");
            break;
    }
}




expl.tab_frame_unload_start = function() 
{
    var frame = document.querySelector("#explorer");
    frame.style.visibility = "hidden";
}

expl.tab_frame_load_end = function() 
{
    var frame       = document.querySelector("#explorer");
    var frame_doc   = frame.contentDocument;
    var frame_path  = decodeURI( frame_doc.location.pathname.replace(/([^\/])\/+$/igm, "$1") );
    var sub_paths   = frame_path.match(/\/[^\/]+/igm) || [];
    
    frame.contentWindow.addEventListener("unload", expl.tab_frame_unload_start);

    var is_file     = false;
    var first_sript = frame_doc.querySelector("head script");
    if (    
        frame_doc.contentType != "text/html" ||
        !first_sript ||
        !first_sript.hasAttribute("src") || 
        !first_sript.getAttribute("src").match(/explorer\.js/i) 
    ) {
        is_file = true;
    }

    expl.current_file   = is_file ? frame_path : false;
    expl.current_dir    = is_file ? frame_path.replace(/\/[^\/]+$/im, "") : frame_path;

    sub_paths.unshift("/");

    var group = document.createElement("div"); 
    group.classList.add("icon_group");

    if ( is_file ) {
        // last folder
        var icon = document.createElement("div");
        icon.classList.add("icon","dir");
        icon.innerHTML = toHTML( sub_paths[sub_paths.length - 2].replace(/^\/([^\/])/igm,"$1") );
        icon.id = "path_part_" + (sub_paths.length - 2);
        icon.setAttribute( "data-path", toHTML(frame_path.replace(/\/[^\/]+$/im, "")) );
        icon.setAttribute( "title", icon.getAttribute("data-path") );
        icon.addEventListener("click", expl.path_btn_clicked);
        group.appendChild(icon);

        // file name
        icon = document.createElement("div");
        icon.classList.add("icon","file");
        icon.innerHTML = toHTML( sub_paths[sub_paths.length - 1].replace(/^\/([^\/])/igm,"$1") );
        icon.setAttribute( "title", icon.innerHTML );
        group.appendChild(icon);
    } else {
        for ( var d = 0, elem, path = ""; d < sub_paths.length; d++ ) {
            path += sub_paths[d];
            elem = document.createElement("div");
            elem.classList.add("icon","dir");
            elem.innerHTML = toHTML( sub_paths[d].replace(/^\/([^\/])/igm,"$1") );
            elem.id = "path_part_"+d;
            elem.setAttribute( "data-path", toHTML(path.replace(/^\/+/igm,"/")) );
            elem.setAttribute( "title", elem.getAttribute("data-path") );
            elem.addEventListener("click", expl.path_btn_clicked);
            group.appendChild(elem);
        }
    }

    var tools = document.querySelector("#explorer_tools");
    tools.innerHTML = "";
    tools.appendChild(group);

    frame.style.visibility = "visible";
}




// do it when window is fully loaded
expl.js_init = function()
{
    console.log("expl.js_init()");

    if ( typeof(tabs) != "object" ) {
        log.add("[EXPL] Tabs panel not found");
        return;
    }
    
    // create TMP element
    expl.tab_content = document.createElement("div");
    expl.tab_content.style.display = "none";
    document.querySelector("body").appendChild(expl.tab_content);
    
    // and load into it tab's content
    loadto("web_files/module/explorer_tab/html/explorer_tab.html", "a", expl.tab_content, 
        function() {
            expl.tab = tabs.add("&#x2009;Explorer&#x2009;", expl.tab_content.innerHTML, 1, false);
            document.querySelector("body").removeChild(expl.tab_content);
            // catch btns clicks
//            document.querySelector("#program_tools").addEventListener("click", expl.btn_clicked );
            lng.update();
            document.querySelector("#explorer").addEventListener("load", expl.tab_frame_load_end );
        }
    );
}




window.addEventListener( "DOMContentLoaded", expl.js_init );
