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

// have we a localStorage?
if ( window.localStorage ) set.db = window.localStorage;




set.add = function ( title, html, className, id )
{
    if ( !("tab" in set) ) return;

    var fieldset = document.createElement("fieldset");

    fieldset.classList.add("settings_block");
    fieldset.innerHTML = "<legend>" + String(title) + "</legend>" + String(html);
    if ( typeof(className) == "string" ) fieldset.classList.add(className);
    if ( typeof(id) == "string" ) fieldset.id = id;

    set.tab.appendChild(fieldset);
    
    return fieldset;
}



// do it when window is fully loaded
set.js_init = function()
{
    console.log("set.js_init()");

    if ( typeof(tabs) != "object" ) {
        log.add("[SET] Tabs panel not found");
        return;
    }
    
    set.tab = tabs.add("&#x2009;Settings&#x2009;", "", 99, false);
}




window.addEventListener( "DOMContentLoaded", set.js_init );
