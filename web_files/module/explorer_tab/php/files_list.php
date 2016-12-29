<?php

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

// get folder path
$dir_path = '../' . (isset($_GET['dir']) ? safestr($_GET['dir']) : "");
if ( !is_dir($dir_path) ) exit;

// get entries list
$list = scandir($dir_path);
$outlist = array();

// filter entries, detect entry types
for ( $e = 0, $max = sizeof($list); $e < $max; ++$e ) {
    // no .. or . entries
    if ( preg_match('#^\.+$#', $list[$e]) ) continue;
    // (if needed) change filename encoding from Windows-1251 to UTF8
    if ( $list[$e] != win2utf8($list[$e]) ) {
        if ( @rename($dir_path.'/'.$list[$e], $dir_path.'/'.win2utf8($list[$e])) ) {
            $list[$e] = win2utf8($list[$e]);
        }
    }
    // set entry type
    $outlist[ $list[$e] ] = is_dir($dir_path.'/'.$list[$e]) ? 'd' : 'f';
}

// output folder entries as unsorted JSON object
print json_encode($outlist);

?>