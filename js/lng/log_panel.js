// UTF8 without BOM

/*
    LOG
*/

// local strings to translate
var lng_local_dic =
[
    { en:"LOG panel", ru:"LOG панель" },
    { en:"Clear LOG", ru:"Очистить LOG" }
];

// add local strings to translate to the global translate list
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];
lng.dic = lng.dic.concat(lng_local_dic);
