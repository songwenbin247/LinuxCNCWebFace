// UTF8 without BOM

/*
    Position
*/

// local strings to translate
var lng_local_dic =
[
    { en:"Position panel", ru:"Панель координат" },
    { en:"work, actual", ru:"рабочие, текущие" },
    { en:"machine, actual", ru:"машинные, текущие" },
    { en:"work, commanded", ru:"рабочие, последние" },
    { en:"machine, commanded", ru:"машинные, последние" },
    { en:"joints, absolute", ru:"моторы, абсолют" },
    { en:"Set", ru:"Выставить" },
    { en:"Click - Edit, ESC - Cancel, ENTER - Set", ru:"Клик - Изменить, ESC - Отмета, ENTER - Применить" },
    { en:"Coordinates type", ru:"Тип координат" },
    { en:"Coordinate System", ru:"Система координат" },
    { en:"limit (max) status", ru:"лимит (макс)" },
    { en:"limit (min) status", ru:"лимит (мин)" },
    { en:"Home", ru:"Дом для" },
    { en:"H", ru:"Д" },
    { en:"Display linear units", ru:"Отображаемые линейные единицы измерения" },
    { en:"Display angular units", ru:"Отображаемые угловые единицы измерения" },
    { en:"auto", ru:"авто" },
    { en:"millimeters", ru:"миллиметры" },
    { en:"centimeters", ru:"сантиметры" },
    { en:"inches", ru:"дюймы" },
    { en:"degrees", ru:"градусы" },
    { en:"radians", ru:"радианы" },
    { en:"gradians", ru:"грады" },
    { en:"none", ru:"отсутствуют" },
    { en:"custom", ru:"собственные" },
];

// add local strings to translate to the global translate list
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];
lng.dic = lng.dic.concat(lng_local_dic);
