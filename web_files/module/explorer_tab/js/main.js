// UTF8 without BOM

/*
    Files explorer Tab
*/

// settings vars and functions
var expl =
{
    db: {}
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
    expl.simpleClickAnimation( event.target.id );
    expl.open_dir( event.target.getAttribute("data-path") );
}

expl.upload_clicked = function()
{
    log.add("[PROG] Upload file to the host PC");
}




expl.update_path_buttons = function ( dir_path ) 
{
    var group = document.querySelector("#explorer_path_buttons");
    var sub_paths = dir_path.match(/\/[^\/]+/igm) || [];

    group.innerHTML = "";

    sub_paths.unshift("/");

    for ( var d = 0, elem, path = ""; d < sub_paths.length; d++ ) {
        path += sub_paths[d];
        elem = document.createElement("div");
        elem.id = "expl_path_btn_" + d;
        elem.classList.add("icon","dir");
        elem.innerHTML = toHTML( sub_paths[d].replace(/^\/([^\/])/igm,"$1") );
        elem.setAttribute( "data-path", toHTML(path.replace(/^\/+/igm,"/")) );
        elem.setAttribute( "title", elem.getAttribute("data-path") );
        elem.addEventListener("click", expl.path_btn_clicked);
        group.appendChild(elem);
    }
}




expl.open_dir = function ( path )
{
    expl.update_path_buttons(path);
    loadto("web_files/module/explorer_tab/php/explorer.php?path="+path, "r", "#explorer" ); 
    return true;
}

expl.open_file = function ( path )
{
    if ( prog && prog.load_file ) prog.load_file(path);
    tabs.activate("program");
    return true;
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
            expl.tab = tabs.add("&#x2009;Explorer&#x2009;", expl.tab_content.innerHTML, "explorer,manager", 1, false);
            document.querySelector("body").removeChild(expl.tab_content);
            lng.update();
            document.querySelector("#upload_file").addEventListener("click", expl.upload_clicked );
            expl.open_dir("/"); 
        }
    );
}




window.addEventListener( "DOMContentLoaded", expl.js_init );
