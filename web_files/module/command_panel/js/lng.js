// UTF8 without BOM

/*
    Command
*/

// local strings to translate
var lng_local_dic =
[
    { en:"Command (MDI) panel", ru:"Коммандная (MDI) панель" },
    { en:"enter command here", ru:"введите команду" },
    { en:"execute", ru:"выполнить" },
];

// add local strings to translate to the global translate list
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];
lng.dic = lng.dic.concat(lng_local_dic);
