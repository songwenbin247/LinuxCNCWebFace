// UTF8 without BOM

/*
    GENERAL
*/

var lcnc_available              = false,
    hal_available               = false,
    halrmt_hello_password       = "EMC",
    halrmt_enable_password      = "EMCTOO",
    linuxcncrsh_hello_password  = "EMC",
    linuxcncrsh_enable_password = "EMCTOO";




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
