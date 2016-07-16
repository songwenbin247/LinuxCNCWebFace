// UTF8 without BOM

/*
    GENERAL
*/

var halrmt_hello_password       = "EMC",
    halrmt_enable_password      = "EMCTOO",
    linuxcncrsh_hello_password  = "EMC",
    linuxcncrsh_enable_password = "EMCTOO",
    halsock_url                 = "ws://"+parent.location.hostname+"/halrmt",
    lcncsock_url                = "ws://"+parent.location.hostname+"/linuxcncrsh",
    sock_proto                  = "telnet",
    sock_check_interval         = 5000,
    axes                        = ["x","y","z","a","b","c"];




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




// load file into element
function loadto ( file, replace, element, code )
{
    if ( !parent.location.protocol.match("http") ) return;
    if ( loadto.busy ) return setTimeout( loadto, 200, file, element, code );
    if ( typeof(element) == "string" ) element = document.querySelector(element);
    if ( ! element ) return;

    loadto.busy                     = true;
    loadto.xhr                      = loadto.xhr ? loadto.xhr : new XMLHttpRequest();
    loadto.xhr.open('GET', file, true);
    loadto.xhr.replace              = replace;
    loadto.xhr.destElement          = element;
    loadto.xhr.evalCode             = code;
    loadto.xhr.onreadystatechange   = loadto.xhr.onreadystatechange ? loadto.xhr.onreadystatechange :
        function()
        {
            if ( this.readyState != 4 || !this.destElement ) return;

            this.destElement.style.opacity = 0;
            this.destElement.innerHTML = 
                ( this.replace ? "" : this.destElement.innerHTML ) +
                ( this.status == 200 ? this.responseText : this.status + ': ' + this.statusText );

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
