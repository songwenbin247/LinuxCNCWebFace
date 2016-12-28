// UTF8 without BOM

/*
    Program Tab
*/

// local strings to translate
var lng_local_dic =
[
    { en:"Program", ru:"Программа" },
    { en:"Open file", ru:"Открыть файл" },
    { en:"Save file", ru:"Сохранить файл" },
    { en:"Upload files", ru:"Загрузка файлов" },
    { en:"Run program", ru:"Пуск программы" },
    { en:"Pause program", ru:"Пауза программы" },
    { en:"Run only current line", ru:"Выполнить только текущую строку" },
    { en:"Abort program", ru:"Стоп программы" },
    { en:"Current line", ru:"Текущая строка" },
    { en:"Current text position", ru:"Текущая позиция в тексте" },
];

// add local strings to translate to the global translate list
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];
lng.dic = lng.dic.concat(lng_local_dic);
