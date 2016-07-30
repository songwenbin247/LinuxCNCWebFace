// UTF8 without BOM

/*
    Settings Tab
*/

// settings vars and functions
var set =
{
    db: {},
    
    current_line: 0
};

// local strings to translate
var lng_local_dic =
[
    { en:"Settings", ru:"Настройки" },
];

// add local strings to translate to the global translate list
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];
lng.dic = lng.dic.concat(lng_local_dic);




// have we a localStorage?
if ( window.localStorage ) set.db = window.localStorage;




// do it when window is fully loaded
set.js_init = function()
{
    console.log("set.js_init()");

    if ( typeof(tabs) != "object" ) {
        log.add("[SET] Tabs panel not found");
        return;
    }
    
    // create TMP element
    set.tab_content = document.createElement("div");
    set.tab_content.style.display = "none";
    document.querySelector("body").appendChild(set.tab_content);
    
    // and load into it tab's content
    loadto("html/settings_tab.html", "a", set.tab_content, 
        function() {
            set.tab = tabs.add("&#x2009;Settings&#x2009;", set.tab_content.innerHTML );
            document.querySelector("body").removeChild(set.tab_content);
        }
    );
}




window.addEventListener( "DOMContentLoaded", set.js_init );
