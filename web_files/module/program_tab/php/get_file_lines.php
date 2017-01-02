<?php

header('Content-type: text/plain');

// get file path
$file_path = isset($_GET['file']) ? get_full_path($_GET['file']) : "";
if ( !is_file($file_path) ) exit('Wrong file path');

// get file start line and lines count
$file_start_line = isset($_GET['start']) ? (int) $_GET['start'] : 0;
$file_lines_count = isset($_GET['count']) ? (int) $_GET['count'] : 0;
if ( $file_lines_count <= 0 ) exit('Lines count <= 0');




// SESSION options to store files index cache
ini_set('session.use_cookies',0);
session_name('wmEdf9Zx');
session_id('yQ6Xn8Zu');
session_start();

if ( !isset($_SESSION['born_time']) ) {
    $_SESSION['born_time'] = time();
} elseif ( $_SESSION['born_time'] < (time() - 60*60*24*7) ) {
    session_unset();
    $_SESSION['born_time'] = time();
}




// creating file index cache
$file_hash = md5('e4CvQ'.$file_path.'qNxY'); // TODO: must be replaced with lightweight hash function

if ( 
    !isset($_SESSION[$file_hash]) ||
    !is_array($_SESSION[$file_hash]) ||
    !isset($_SESSION[$file_hash]['mod_time']) ||
    $_SESSION[$file_hash]['mod_time'] != filemtime($file_path)
) {
    // file read parameters
    $read_buffer_size = 10240; // bytes
    $read_buffer = '';
    $read_pos = 0;

    // for index file with new lines positions
    $bin = '';
    $bin .= pack('L', 0);

    $file = fopen($file_path,'r');
    while ( $read_buffer = fread($file, $read_buffer_size) ) {
        $found = preg_match_all("#\n#im", $read_buffer, $newlines, PREG_OFFSET_CAPTURE);
        if ( $found && is_array($newlines) && is_array($newlines[0]) ) {
            for ( $i = 0, $max = sizeof($newlines[0]); $i < $max; $i++ ) {
                $bin .= pack('L', $read_pos + $newlines[0][$i][1] + 1);
            }
        }
        $read_pos += $read_buffer_size;
    }
    fclose($file);

    $bin .= pack('L', filesize($file_path));

    $_SESSION[$file_hash] = array(
        'index' => $bin,
        'mod_time' => filemtime($file_path)
    );
}




// getting file start and end positions
$pos_bytes = 4;

$start = substr($_SESSION[$file_hash]['index'], $pos_bytes*$file_start_line, $pos_bytes);
$end = substr($_SESSION[$file_hash]['index'], $pos_bytes*($file_start_line + $file_lines_count), $pos_bytes);
session_write_close(); // unlock session files

$start = ($start && strlen($start) == $pos_bytes) ? unpack("L",$start)[1] : false;
$end = ($end && strlen($end) == $pos_bytes) ? unpack("L",$end)[1] : filesize($file_path);




// output
if ( is_int($start) && is_int($end) && $start < $end ) {
    $file = fopen($file_path,'r');
    fseek($file, $start, SEEK_SET);
    $output = fread($file, $end - $start);
    fclose($file);

    print $output;
}









function safestr ($str = '')
{
    $str = strip_tags($str); 
    $str = preg_replace('/[\r\n\t]+/', ' ', $str);
    $str = preg_replace('/[\\\%\"\*\:\<\>\?\'\|]+/', '', $str);
    //$str = preg_replace('/^[\\\.\/]+/', '', $str);
    $str = preg_replace('/\/+$/', '', $str);
    $str = preg_replace('/\\+/', '/', $str);
    $str = html_entity_decode( $str, ENT_QUOTES, 'utf-8' );
    $str = htmlentities($str, ENT_QUOTES, 'utf-8');
    $str = preg_replace("/(&)([a-z])([a-z]+;)/i", '$2', $str);
    return $str;
}

function get_full_path ( $path ) {
    $linuxcnc_dir = preg_replace('#^(/home/[^/]+/[^/]+/).+$#i', '$1', __FILE__);
    $path =  safestr($path);
    
    // don't show php files
    if ( preg_match('#[^\w]php$#im',$path) ) return '';

    // correct full path
    if ( strpos($path,$linuxcnc_dir,0) === 0 && is_file($path) ) return $path;

    // correct short path
    $path = $linuxcnc_dir . preg_replace('#^[\\\.\/]+#','',$path);
    if ( is_file($path) ) return $path;

    // incorrect path
    return '';
}

?>