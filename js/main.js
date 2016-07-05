// UTF8 without BOM

/*
    GENERAL
*/

var lcnc_available = false,
    hal_available = false;




// safe convert to number
function n ( value )
{
    var out = String(value);
    out = out.replace( /[^0-9.,\-\+]+/igm, "" );
    out = out.replace( /^\++/igm, "" );
    out = out.replace( /[,.]+/igm, "." );
    out = Number(out);
    return isNaN(out) || out == undefined ? 0 : out;
}
