<?php

header('Content-type: text/plain');

/*
$nums = array(156752896,2,0,444,-14);

for ( $i = 0, $bin = ""; $i < sizeof($nums); ++$i )
{
    $bin = pack("L",$nums[$i]);
    print $nums[$i].' = '.bin2hex($bin).' = '.unpack("L",$bin)[1].' = '.strlen($bin).' bytes'."\n";
}
*/

/*
$str = "qwe\r\nasd\r\nzxc\n123";
preg_match_all("#\n#im", $str, $matches, PREG_OFFSET_CAPTURE);
print_r($matches);
*/


$linuxcnc_dir = preg_replace('#^(/home/[^/]+/[^/]+/).+$#i', '$1', __FILE__);
print $linuxcnc_dir . "\n";
print '/home/master/linuxcnc/nc_files/D6'.' = '.get_full_path('/home/master/linuxcnc/nc_files/D6') . "\n";
print 'nc_files/0.1.nc'.' = '.get_full_path('nc_files/0.1.nc') . "\n";
print './nc_files/D6'.' = '.get_full_path('./nc_files/D6') . "\n";

function get_full_path ( $path ) {
    global $linuxcnc_dir;
    
    // correct full path
    if ( strpos($path,$linuxcnc_dir,0) === 0 && is_file($path) ) return $path;

    // correct short path
    $path = $linuxcnc_dir . preg_replace('#^[\\\.\/]+#','',$path);
    if ( is_file($path) ) return $path;

    // incorrect path
    return '';
}

?>