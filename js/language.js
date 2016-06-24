// UTF8 without BOM

/*
    Language
*/

// settings vars and functions
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];




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

    if ( log && log.add ) log.add("[LNG] " + from.toUpperCase() + " -&gt; " + to.toUpperCase());

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
        if ( ! lng.db["lng"] || ! lng.dic[0][ lng.db["lng"] ] )
            lng.db["lng"] = lng.list[0];

        // if current language code (from DB) differs from default language code
        if ( lng.db["lng"] != lng.list[0] ) lng.change( lng.list[0], lng.db["lng"] );
    }

    //test
    //lng.change("en","ru");
}




window.addEventListener( "DOMContentLoaded", lng.js_init );
