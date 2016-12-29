// UTF8 without BOM

/*
    Program Tab
*/

// local strings to translate
var lng_local_dic =
[
    { en:"Program", ru:"Программа" },
    { en:"Open file", ru:"Открыть файл" },
    { en:"Open", ru:"Открыть" },
    { en:"Reload file", ru:"Открыть файл заново" },
    { en:"Reload", ru:"Обновить" },
    { en:"Save file", ru:"Сохранить файл" },
    { en:"Save", ru:"Сохранить" },
    { en:"Run program", ru:"Пуск программы" },
    { en:"Run", ru:"Пуск" },
    { en:"Pause program", ru:"Пауза программы" },
    { en:"Pause", ru:"Пауза" },
    { en:"Run only current line", ru:"Выполнить только текущую строку" },
    { en:"Step", ru:"Шаг" },
    { en:"Abort program", ru:"Стоп программы" },
    { en:"Abort", ru:"Стоп" },
    { en:"Current line", ru:"Текущая строка" },
    { en:"Current text position", ru:"Текущая позиция в тексте" },
];

// add local strings to translate to the global translate list
if ( !lng ) lng = {};
if ( !lng.dic ) lng.dic = [];
lng.dic = lng.dic.concat(lng_local_dic);
