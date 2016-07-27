// UTF8 without BOM

/*
    CTRL
*/

// settings vars and functions
var ctrl =
{
    db: {},
};

// local strings to translate
var lng_local_dic =
[
    { en:"E-STOP", ru:"Е-СТОП" },
];

// add local strings to translate to the global translate list
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];
lng.dic = lng.dic.concat(lng_local_dic);




// have we a localStorage?
if ( window.localStorage ) ctrl.db = window.localStorage;




// do it when window is fully loaded
ctrl.js_init = function()
{
    console.log("ctrl.js_init()");
}




window.addEventListener( "DOMContentLoaded", ctrl.js_init );
