// UTF8 without BOM

/*
    Settings
*/

// settings vars and functions
var set =
{
    db: {},
};

// local strings to translate
var lng_local_dic =
[
    { en:"Settings", ru:"Настройки" },
    { en:"CNC Router", ru:"Станок с ЧПУ" },
];

// add local strings to translate to the global translate list
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];
lng.dic = lng.dic.concat(lng_local_dic);




// have we a localStorage?
if ( window.localStorage ) set.db = window.localStorage;




set.show_panel = function()
{
    document.querySelector("#settings").style.display = "block";
    set.panel_visible = true;
}
set.hide_panel = function()
{
    document.querySelector("#settings").style.display = "none";
    set.panel_visible = false;
}




// on settings tab click
set.on_settings_tab_click = function ( event )
{
    var tab         = event.target,
        tab_parent  = tab.parentElement,
        tab_index   = tab_parent.children.length - 1,
        contents    = document.querySelector("#settings_tabs_content");

    for ( ; tab_index >= 0; tab_index-- )
    {
        if ( tab_parent.children[tab_index] == tab )
        {
            tab_parent.children[tab_index].classList.add("settings_active_tab");
            contents.children[tab_index].style.display = "block";
        }
        else
        {
            tab_parent.children[tab_index].classList.remove("settings_active_tab");
            contents.children[tab_index].style.display = "none";
        }
    }
}

// add settings tab
set.add_settings_tab = function ( tab_title, tab_content )
{
    var tabs        = document.querySelector("#settings_tabs"),
        contents    = document.querySelector("#settings_tabs_content"),
        tab         = document.createElement("div");
        content     = document.createElement("div");

    tab.innerHTML       = tab_title;
    content.innerHTML   = tab_content;

    if ( tabs.children.length <= 1 ) tab.classList.add("settings_active_tab");
    tab.addEventListener("click", set.on_settings_tab_click);

    tabs.appendChild(tab);
    contents.appendChild(content);
}




// do it when window is fully loaded
set.js_init = function()
{
    console.log("set.js_init()");

    // repeat start of this function if settings is not loaded
    if ( ! document.querySelector("#settings_close") ) return setTimeout(set.js_init, 3000);

    if ( set.js_initialized ) return;
    else set.js_initialized = true;

    // add event listeners to open/close settings window
    document.querySelector("#settings_close").addEventListener("click", set.hide_panel);
}




window.addEventListener( "DOMContentLoaded", set.js_init );
