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
