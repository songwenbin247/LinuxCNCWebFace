// UTF8 without BOM

/*
    JOG PANEL
*/

// local strings to translate
var lng_local_dic =
[
    { en:"JOG panel", ru:"JOG панель" },
    { en:"Feed", ru:"Подача" },
    { en:"Movements type", ru:"Режим движения" },
    { en:"auto", ru:"авто" },
    { en:"manual", ru:"ручной" },
    { en:"GOTO", ru:"ЕДЕМ" },
    { en:"GO", ru:"ЕДЕМ" },
    { en:"TO", ru:"В" },
    { en:"HOME", ru:"ДОМОЙ" },
    { en:"STOP", ru:"СТОП" },
    { en:"ALL", ru:"ВСЕ" },
];

// add local strings to translate to the global translate list
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];
lng.dic = lng.dic.concat(lng_local_dic);
