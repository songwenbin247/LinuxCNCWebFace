// UTF8 without BOM

/*
    Program Tab
*/

// settings vars and functions
var prog =
{
    db: {},
};

// local strings to translate
var lng_local_dic =
[
    { en:"Program", ru:"Программа" },
];

// add local strings to translate to the global translate list
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];
lng.dic = lng.dic.concat(lng_local_dic);




// have we a localStorage?
if ( window.localStorage ) prog.db = window.localStorage;




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
            tabs.add("&#x2009;Program&#x2009;", prog.tab_content.innerHTML );
            document.querySelector("body").removeChild(prog.tab_content);
        }
    );
}




window.addEventListener( "DOMContentLoaded", prog.js_init );
