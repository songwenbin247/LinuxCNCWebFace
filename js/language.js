// UTF8 without BOM

/*
    Language
*/

// local strings to translate
var lng_local_dic =
[
    { en:"Language", ru:"Язык" },
    { en:"Current UI language", ru:"Текущий язык интерфейса" },
];

// add local strings to translate to the global translate list
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];
lng.dic = lng.dic.concat(lng_local_dic);




// have we a localStorage?
lng.db = {};
if ( window.localStorage ) lng.db = window.localStorage;




lng.change = function ( from, to )
{
    if (
        !lng.dic ||
        lng.list.length < 2 ||
        from == to ||
        !lng.dic[0][from] ||
        !lng.dic[0][to]
    ) {
        return;
    }

    // find all elements with innerText contains special char (\u2009)
    var with_text = document.evaluate (
        "//*[contains(text(), '\u2009')]", document,
        null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE
    );

    // walk through all found elements
    for ( var i = 0, element, frazes; i < with_text.snapshotLength; i++ ) {
        element = with_text.snapshotItem(i);

        // find all frazes for translate in the innerText of current element
        frazes = element.innerHTML.match( /\u2009[^<>\u2009]+\u2009/gm );
        if ( !frazes ) break;

        // "translate" frazes
        for ( var f = 0; f < frazes.length; f++ ) {
            for ( var d = 0; d < lng.dic.length; d++ ) {
                if ( lng.dic[d][from] == frazes[f].trim() ) {
                    element.innerHTML = element.innerHTML.replace( lng.dic[d][from], lng.dic[d][to] );
                    break;
                }
            }
        }
    }

    var attributes = ["placeholder", "title", "value"];

    for ( a = 0; a < attributes.length; a++ )
    {
        // find all elements with selected attribute contains special char (\u2009)
        var with_attr_text = document.evaluate (
            "//*[contains(@"+attributes[a]+", '\u2009')]", document,
            null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE
        );

        // walk through all found elements
        for ( var i = 0, element, frazes; i < with_attr_text.snapshotLength; i++ ) {
            element = with_attr_text.snapshotItem(i);

            // find all frazes for translate in the innerText of current element
            frazes = element.getAttribute(attributes[a]).match( /\u2009[^\u2009]+\u2009/gm );
            if ( !frazes ) break;

            // "translate" frazes
            for ( var f = 0; f < frazes.length; f++ ) {
                for ( var d = 0; d < lng.dic.length; d++ ) {
                    if ( lng.dic[d][from] == frazes[f].trim() ) {
                        element.setAttribute (
                            attributes[a],
                            element.getAttribute(attributes[a]).replace( lng.dic[d][from], lng.dic[d][to] )
                        );
                        break;
                    }
                }
            }
        }
    }

    // save new language code to DB
    lng.db["lng"] = to;
}

lng.update = function() {
    if ( lng.db["lng"] != lng.list[0] ) lng.change( lng.list[0], lng.db["lng"] );

    // save new language code to the cookie
    var t = new Date();
    t.setTime( t.getTime() + 60*60*24*365 );
    document.cookie = "lng=" + lng.db["lng"] + "; expires=" + t.toUTCString();
}

lng.createSelectorElement = function()
{
    var select = document.createElement("SELECT");

    for ( var c = 0, option; c < lng.list.length; c++ )
    {
        option = document.createElement("OPTION");
        option.value        = lng.list[c];
        option.innerHTML    = lng.list[c].toUpperCase();
        if ( lng.db["lng"] == lng.list[c] ) option.selected = "selected";
        select.appendChild(option);
    }

    select.onchange = function()
    {
        if ( lng.db["lng"] == this.value ) return;
        lng.change(lng.db["lng"], this.value);
        lng.update();
    };

    return select;
}




// do it when window is fully loaded
lng.js_init = function()
{
    console.log("lng.js_init()");

    // get language codes list
    lng.list = [];
    if ( typeof(lng.dic) == "object" && lng.dic[0] )
    {
        for ( var code in lng.dic[0] )
            lng.list[lng.list.length] = code;
    }

    // if we have more than 1 language
    if ( lng.list.length > 1 )
    {
        // save default language to DB if not exists
        if ( ! lng.db["lng"] || ! lng.dic[0][ lng.db["lng"] ] ) lng.db["lng"] = lng.list[0];
        // and change current language if needed
        lng.update();
    }

    // add panel settings to the Settings tab
    if ( typeof(tabs) == "object" && typeof(set) == "object" ) {
        // create TMP element
        lng.tmp_settings_block = document.createElement("div");
        lng.tmp_settings_block.style.display = "none";
        document.querySelector("body").appendChild(lng.tmp_settings_block);

        loadto("html/lng_settings_block.html", "a", lng.tmp_settings_block, 
            function() {
                lng.settings_block = set.add("&#x2009;Language&#x2009;", lng.tmp_settings_block.innerHTML);
                document.querySelector("body").removeChild(lng.tmp_settings_block);
                document.querySelector("#lng_select_box").appendChild( lng.createSelectorElement() );
                lng.update();
            }
        );
    }
}




window.addEventListener( "DOMContentLoaded", lng.js_init );
