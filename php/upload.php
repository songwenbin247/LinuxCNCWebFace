<?php

// get folder path
$dir_path   = '../' . (isset($_GET['dir']) ? safestr($_GET['dir']) : "");
$what       = 'files';

// exit if we have errors
if ( !is_dir($dir_path) ) exit('no dir');
if ( !isset($_FILES[$what]) || count($_FILES[$what]["error"]) <= 0 ) exit('no files');

$files = $_FILES[$what];

// move/rename files to destination folder
foreach ($files["error"] as $key => $error) {
    if ( $error == UPLOAD_ERR_OK ) { // if no errors while uploading current file
        // prevent hacking
        $clean_name = basename( safestr($files["name"][$key]) );
        // move file to destination
        move_uploaded_file( $files["tmp_name"][$key], $dir_path . '/' . $clean_name );
        // rename if we have Win1251 charset instead of UTF-8
        if ( $base_name != win2utf8($clean_name) ) {
            @rename( $dir_path.'/'.$clean_name, $dir_path.'/'.win2utf8($clean_name) );
        }
    }
}




function safestr ($str = '')
{
    $str = strip_tags($str); 
    $str = preg_replace('/[\r\n\t ]+/', ' ', $str);
    $str = preg_replace('/[\\\%\"\*\:\<\>\?\'\|\.]+/', '', $str);
    $str = preg_replace('/^[\\\.\/]+/', '', $str);
    $str = preg_replace('/\/+$/', '', $str);
    $str = preg_replace('/\\+/', '/', $str);
    $str = html_entity_decode( $str, ENT_QUOTES, "utf-8" );
    $str = htmlentities($str, ENT_QUOTES, "utf-8");
    $str = preg_replace("/(&)([a-z])([a-z]+;)/i", '$2', $str);
    return $str;
}
function win2utf8 ( $str = '' ) 
{
    return preg_match("#[\xC0-\xFF]{2,}#", $str) ? // I know it's very bad filter for strings in Win1251 encoding
        iconv("Windows-1251", "UTF-8", $str) :
        $str;
}

?>