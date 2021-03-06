// UTF8 without BOM

/*
    GENERAL
*/

var HALRMT_HELLO_PASSWORD       = "EMC",
    HALRMT_ENABLE_PASSWORD      = "EMCTOO",
    LINUXCNCRSH_HELLO_PASSWORD  = "EMC",
    LINUXCNCRSH_ENABLE_PASSWORD = "EMCTOO",
    HALSOCK_URL                 = "ws://"+parent.location.hostname+"/halrmt",
    LCNCSOCK_URL                = "ws://"+parent.location.hostname+"/linuxcncrsh",
    SOCK_PROTO                  = "telnet",
    SOCK_CHECK_INTERVAL         = 5000,
    AXES                        = ["x","y","z","a","b","c"];




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

// like PHP's htmlspecialchars()
function toHTML ( text ) 
{
    return text
        .replace(/&/gm, "&amp;")
        .replace(/</gm, "&lt;")
        .replace(/>/gm, "&gt;")
        .replace(/"/gm, "&quot;")
        .replace(/'/gm, "&#039;");
}

// units conversion
function u2u ( value, type, fixed )
{
    value   = Number(value);
    type    = String(type).toUpperCase();

    switch ( type ) {
        // linear
        case "MM:CM":   value /= 10; break;
        case "MM:INCH": value /= 25.4; break;
        case "CM:MM":   value *= 10; break;
        case "CM:INCH": value /= 2.54; break;
        case "INCH:MM": value *= 25.4; break;
        case "INCH:CM": value *= 2.54; break;
        // angular
        case "DEG:RAD": value *= Math.PI/180; break;
        case "DEG:GRAD": value *= 400/360; break;
        case "RAD:DEG": value /= Math.PI/180; break;
        case "RAD:GRAD": value *= 200/Math.PI; break;
        case "GRAD:DEG": value /= Math.PI/180; break;
        case "GRAD:RAD": value /= 200/Math.PI; break;
    }
    
    return value.toFixed( Number(fixed) );
}




// load file into element
function loadto ( file, loadmode, element, code, cleanup_html )
{
    if ( !parent.location.protocol.match("http") ) return;
    if ( loadto.busy ) return setTimeout( loadto, 200, file, loadmode, element, code, cleanup_html );
    if ( typeof(element) == "string" ) element = document.querySelector(element);
    if ( ! element ) return;

    loadto.busy                     = true;
    loadto.xhr                      = loadto.xhr ? loadto.xhr : new XMLHttpRequest();
    loadto.xhr.open('GET', file, true);
    loadto.xhr.loadmode             = loadmode ? loadmode : "a";
    loadto.xhr.destElement          = element;
    loadto.xhr.evalCode             = code ? code : false;
    loadto.xhr.cleanup_html         = cleanup_html ? true : false;
    loadto.xhr.onreadystatechange   = loadto.xhr.onreadystatechange ? loadto.xhr.onreadystatechange :
        function()
        {
            if ( this.readyState != 4 || !this.destElement ) return;

            this.destElement.style.opacity = 0;

            var source = (this.status == 200) ? this.responseText : (this.status + ': ' + this.statusText);
            if ( this.cleanup_html ) source = toHTML(source);
            
            switch ( this.loadmode ) {
                case "p":
                case "pre":
                case "prepend":
                case "before":
                    this.destElement.innerHTML = source + this.destElement.innerHTML;
                    break;
                case "a":
                case "post":
                case "append":
                case "after":
                    this.destElement.innerHTML = this.destElement.innerHTML + source;
                    break;
                default:
                    this.destElement.innerHTML = source;
            }

            setTimeout( 
                function(e) {
                    e.style.transition = "opacity 1s linear";
                    e.style.opacity = 1;
                }, 
                50, 
                this.destElement 
            );

            if ( this.evalCode ) setTimeout(this.evalCode, 1);

            loadto.busy = false;
        }
    loadto.xhr.send();
}
