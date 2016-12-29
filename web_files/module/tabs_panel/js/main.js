// UTF8 without BOM

/*
    Tabs
*/

// settings vars and functions
var tabs =
{
    db: {},
};

// have we a localStorage?
if ( window.localStorage ) tabs.db = window.localStorage;




// on tab title click
tabs.on_tab_title_click = function ( event )
{
    if ( event.target.id && event.target.id == "tabs_titles" ) return;

    var titles = document.querySelector("#tabs_titles");

    for ( var i = 0; i < titles.children.length; i++ ) {
        if ( event.target == titles.children[i] ) {
            tabs.activate(i);
            return;
        }
    }
}




// add tab
tabs.add = function ( tab_title, tab_content, tab_tags, index, active )
{
    var titles      = document.querySelector("#tabs_titles"),
        contents    = document.querySelector("#tabs_contents"),
        tab         = document.createElement("div"),
        content     = document.createElement("div");
    
    tab.setAttribute( "data-tags", toHTML( String(tab_tags) ) );

    tab.innerHTML       = String(tab_title);
    content.innerHTML   = String(tab_content);

    if ( typeof(index) == "number" ) {
        index = index.toFixed(0);
        if ( index < 0 ) index = 0;
        else if ( index >= titles.children.length ) index = titles.children.length - 1;
        titles.insertBefore(tab, titles.children[index]);
        contents.insertBefore(content, contents.children[index]);
    } else {
        titles.appendChild(tab);
        contents.appendChild(content);
        index = titles.children.length - 1;
    }
    
    if ( active || titles.children.length <= 1 ) tabs.activate(index);

    document.querySelector("#tabs_panel").style.display = "block";
    
    return content;
}

tabs.remove = function ( index )
{
    if ( typeof(index) != "number" ) return;
    else index = index.toFixed(0);

    var titles      = document.querySelector("#tabs_titles"),
        contents    = document.querySelector("#tabs_contents");
        
    if ( titles.children.length <= 0 ) return;

    if ( index < 0 ) index = 0;
    else if ( index >= titles.children.length ) index = titles.children.length - 1;

    titles.removeChild(titles.children[index]);
    contents.removeChild(contents.children[index]);
    
    tabs.activate(0);

    if ( titles.children.length <= 0 ) document.querySelector("#tabs_panel").style.display = "none";
}

tabs.activate = function ( index )
{
    var titles      = document.querySelector("#tabs_titles"),
        contents    = document.querySelector("#tabs_contents"),
        tags        = false;

    if ( titles.children.length <= 0 ) return;

    if ( typeof(index) == "Number" ) {
        index = Number(index).toFixed(0);
        if ( index < 0 ) index = 0;
        else if ( index >= titles.children.length ) index = titles.children.length - 1;
    } else {
        tags = String(index);
    }
    
    for ( var i = 0; i < titles.children.length; i++ ) {
        if ( (tags && titles.children[i].getAttribute("data-tags").includes(tags)) || index == i ) {
            titles.children[i].classList.add("active_tab");
            contents.children[i].style.display = "block";
        } else {
            titles.children[i].classList.remove("active_tab");
            contents.children[i].style.display = "none";
        }
    }
}




// do it when window is fully loaded
tabs.js_init = function()
{
    console.log("tabs.js_init()");
    
    document.querySelector("#tabs_titles").addEventListener("click", tabs.on_tab_title_click);
}




window.addEventListener( "DOMContentLoaded", tabs.js_init );
