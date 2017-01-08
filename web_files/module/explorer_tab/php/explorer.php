<?php

// language settings and strings
$lng = isset($_COOKIE) && isset($_COOKIE['lng']) ? $_COOKIE['lng'] : 'en'; 
$dic = array(
    'Unable to call' => array( 'ru'=>'Нельзя показать' ),
    'directly' => array( 'ru'=>'напрямую' ),
    'is not a valid path' => array( 'ru'=>'это неверный путь' ),
    'Unknown File' => array( 'ru'=>'Неизвестный' ),
    'Image' => array( 'ru'=>'Картинка' ),
    'Video' => array( 'ru'=>'Видео' ),
    'Archive' => array( 'ru'=>'Архив' ),
    'Document' => array( 'ru'=>'Документ' ),
    'Font' => array( 'ru'=>'Шрифт' ),
    'File' => array( 'ru'=>'Файл' ),
    'Index of' => array( 'ru'=>'Содержимое' ),
    'Directory Listing' => array( 'ru'=>'Содержимое папки' ),
    'Directory' => array( 'ru'=>'Папка' ),
    'Name' => array( 'ru'=>'Имя' ),
    'Last Modified' => array( 'ru'=>'Изменено' ),
    'Size' => array( 'ru'=>'Размер' ),
    'Type' => array( 'ru'=>'Тип' ),
    'Parent Directory' => array( 'ru'=>'Назад' ),
    // bytes
    'YB' => array( 'ru'=>'Йб' ),
    'ZB' => array( 'ru'=>'Зб' ),
    'EB' => array( 'ru'=>'Эб' ),
    'PB' => array( 'ru'=>'Пб' ),
    'TB' => array( 'ru'=>'Тб' ),
    'GB' => array( 'ru'=>'Гб' ),
    'MB' => array( 'ru'=>'Мб' ),
    'KB' => array( 'ru'=>'Кб' ),
    'B' => array( 'ru'=>'б' ),
);

// explorer settings
$show_hidden_files = true;
$calculate_folder_size = false;

// Various file type associations
$movie_types = array('mpg','mpeg','avi','asf','mp3','wav','mp4','wma','aif','aiff','ram', 'midi','mid','asf','au','flac');
$image_types = array('jpg','jpeg','gif','png','tif','tiff','bmp','ico');
$archive_types = array('zip','cab','7z','gz','tar.bz2','tar.gz','tar','rar');
$document_types = array('txt','text','doc','docx','abw','odt','pdf','rtf','tex','texinfo');
$font_types = array('ttf','otf','abf','afm','bdf','bmf','fnt','fon','mgf','pcf','ttc','tfm','snf','sfd');




$module_rel_dir = preg_replace('#^/home/[^/]+/[^/]+(/web_files/module/[^/]+/).+$#i', '$1', __FILE__);
$linuxcnc_dir   = preg_replace('#^(/home/[^/]+/[^/]+/).+$#i', '$1', __FILE__);

// Get the path (cut out the query string from the request_uri)
$path = '/';
if ( isset($_GET['path']) && $_GET['path'] ) $path = $_GET['path'];
$path = get_full_path($path);

if ( strlen($path) == 0 ) $path = $linuxcnc_dir;
if ( !is_dir($path) ) die("<b>" . $path . "</b> ".lng('is not a valid path'));

$rel_path = preg_replace('#^'.$linuxcnc_dir.'#', '', $path);
$rel_path = $rel_path ? '/'.$rel_path : '';




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

function get_full_path ( $path ) 
{
    $linuxcnc_dir = preg_replace('#^(/home/[^/]+/[^/]+/).+$#i', '$1', __FILE__);
    $path =  safestr($path);
    
    // correct full path
    if ( strpos($path,$linuxcnc_dir,0) === 0 && is_dir($path) ) return $path;

    // correct short path
    $path = $linuxcnc_dir . preg_replace('#^[\\\.\/]+#','',$path);
    if ( is_dir($path) ) return $path;

    // incorrect path
    return '';
}

//
function lng ( $fraze = '.' )
{
    global $dic, $lng;
    
    if ( $lng == 'en' || !array_key_exists($fraze, $dic) ) return $fraze;
    if ( !array_key_exists($lng, $dic[$fraze]) ) return $fraze;
    return $dic[$fraze][$lng];
}


//
// Get the size in bytes of a folder
//
function foldersize($path) {
	$size = 0;
	if($handle = @opendir($path)){
		while(($file = readdir($handle)) !== false) {
			if(is_file($path."/".$file)){
				$size += filesize($path."/".$file);
			}
			
			if(is_dir($path."/".$file)){
				if($file != "." && $file != "..") {
					$size += foldersize($path."/".$file);
				}
			}
		}
	}
	
	return $size;
}


//
// This function returns the file size of a specified $file.
//
function format_bytes($size, $precision=0) {
    $sizes = array( lng('YB'), lng('ZB'), lng('EB'), lng('PB'), lng('TB'), lng('GB'), lng('MB'), lng('KB'), lng('B') );
    $total = count($sizes);

    while($total-- && $size > 1024) $size /= 1024;
    return sprintf('%.'.$precision.'f', $size).' '.$sizes[$total];
}


//
// This function returns the mime type of $file.
//
function get_file_type($file) {
	global 
        $image_types, 
        $movie_types,
        $archive_types,
        $document_types,
        $font_types;
	
	$pos = strrpos($file, ".");
	if ($pos === false) {
		return '&#x2009;'.lng("Unknown File").'&#x2009;';
	}
	
	$ext = rtrim(substr($file, $pos+1), "~");
	if(in_array($ext, $image_types)) {
		$type = lng("Image");
	
	} elseif(in_array($ext, $movie_types)) {
		$type = lng("Video");
	
	} elseif(in_array($ext, $archive_types)) {
		$type = lng("Archive");
	
	} elseif(in_array($ext, $document_types)) {
		$type = lng("Document");
	
	} elseif(in_array($ext, $font_types)) {
		$type = lng("Font");
	
	} else {
		$type = lng("File");
	}
	
	return(strtoupper($ext) . '&#x2009;' . $type . '&#x2009;');
}



// Print the heading stuff
print "<table cellpadding='0' cellspacing='0'>";




// Get all of the folders and files. 
$folderlist = array();
$filelist = array();
$handle = opendir($path);
if ( $handle ) 
{
	while(($item = readdir($handle)) !== false) {
		if(is_dir($path.'/'.$item) and $item != '.' and $item != '..') {
			if( $show_hidden_files == "false" ) {
				if(substr($item, 0, 1) == "." or substr($item, -1) == "~") {
				  continue;
				}
			}
			$folderlist[] = array(
				'name' => $item, 
				'size' => (($calculate_folder_size)?foldersize($path.'/'.$item):0), 
				'modtime'=> filemtime($path.'/'.$item),
				'file_type' => '&#x2009;'.lng("Directory").'&#x2009;'
			);
		}
		
		elseif(is_file($path.'/'.$item)) {
			if( $show_hidden_files == "false" ) {
				if(substr($item, 0, 1) == "." or substr($item, -1) == "~") {
				  continue;
				}
			}
			$filelist[] = array(
				'name'=> $item, 
				'size'=> filesize($path.'/'.$item), 
				'modtime'=> filemtime($path.'/'.$item),
				'file_type' => get_file_type($path.'/'.$item)
			);
		}
	}
	closedir($handle);
}


if(!isset($_GET['sort'])) {
	$_GET['sort'] = 'name';
}

// Figure out what to sort files by
$file_order_by = array();
foreach ($filelist as $key=>$row) {
    $file_order_by[$key]  = $row[$_GET['sort']];
}

// Figure out what to sort folders by
$folder_order_by = array();
foreach ($folderlist as $key=>$row) {
    $folder_order_by[$key]  = $row[$_GET['sort']];
}

// Order the files and folders
if( isset($_GET['order']) && $_GET['order'] ) {
	array_multisort($folder_order_by, SORT_DESC, $folderlist);
	array_multisort($file_order_by, SORT_DESC, $filelist);
} else {
	array_multisort($folder_order_by, SORT_ASC, $folderlist);
	array_multisort($file_order_by, SORT_ASC, $filelist);
	$order = "&order=desc";
}


// Show sort methods
print "<thead><tr>";

$sort_methods = array();
$sort_methods['name'] = '&#x2009;'.lng("Name").'&#x2009;';
$sort_methods['modtime'] = '&#x2009;'.lng("Last Modified").'&#x2009;';
$sort_methods['size'] = '&#x2009;'.lng("Size").'&#x2009;';
$sort_methods['file_type'] = '&#x2009;'.lng("Type").'&#x2009;';

foreach($sort_methods as $key=>$item) {
	if($_GET['sort'] == $key) {
		print "<th class='n'><a href='?sort=$key$order'>$item</a></th>";
	} else {
		print "<th class='n'><a href='?sort=$key'>$item</a></th>";
	}
}
print "</tr></thead><tbody>";



// This simply creates an extra line for file/folder seperation
print "<tr><td colspan='4' style='height:7px;'></td></tr>";



// Print folder information
foreach($folderlist as $folder) {
	print "<tr><td class='n'><a class='folder' href='javascript:expl.open_dir(\"".$rel_path.'/'.addslashes($folder['name'])."\")'>" .htmlentities($folder['name']). "</a></td>";
	print "<td class='m' title='" . date('H:i:s', $folder['modtime']) . "'>" . date('d.m.Y', $folder['modtime']) . "</td>";
	print "<td class='s'>" . (($calculate_folder_size)?format_bytes($folder['size'], 2):'--') . "&nbsp;</td>";
	print "<td class='t'>" . $folder['file_type']                    . "</td></tr>";
}



// This simply creates an extra line for file/folder seperation
print "<tr><td colspan='4' style='height:7px;'></td></tr>";



// Print file information
foreach($filelist as $file) {
	print "<tr><td class='n'><a class='file' href='javascript:expl.open_file(\"".$rel_path.'/'.addslashes($file['name'])."\")'>" .htmlentities($file['name']). "</a></td>";
	print "<td class='m' title='" . date('H:i:s', $file['modtime']) . "'>" . date('d.m.Y', $file['modtime'])   . "</td>";
	print "<td class='s'>" . format_bytes($file['size'],0)           . "&nbsp;</td>";
	print "<td class='t'>" . $file['file_type']                      . "</td></tr>";
}



// Print ending stuff
print "</tbody></table>";

?>