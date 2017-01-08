// UTF8 without BOM

/*
    Program Tab
*/

// local strings to translate
var lng_local_dic =
[
    { en:"Explorer", ru:"Проводник" },
    { en:"Upload files", ru:"Загрузка файлов" },
    { en:"Upload", ru:"Загрузить" },

    { en:"Name", ru:"Имя" },
    { en:"Last Modified", ru:"Изменено" },
    { en:"Size", ru:"Размер" },
    { en:"Type", ru:"Тип" },
    { en:"Directory", ru:"Папка" },
    { en:"Unknown File", ru:"Неизветсный файл" },
    { en:"Image", ru:"Картинка" },
    { en:"Video", ru:"Видео" },
    { en:"Archive", ru:"Архив" },
    { en:"Document", ru:"Документ" },
    { en:"Font", ru:"Шрифт" },
    { en:"File", ru:"Файл" }
];

// add local strings to translate to the global translate list
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];
lng.dic = lng.dic.concat(lng_local_dic);
