// UTF8 without BOM

/*
    Program Tab
*/

// local strings to translate
var lng_local_dic =
[
    { en:"Explorer", ru:"Проводник" },
    { en:"Upload files", ru:"Загрузка файлов" },
    { en:"Upload", ru:"Загрузить" }
];

// add local strings to translate to the global translate list
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];
lng.dic = lng.dic.concat(lng_local_dic);
