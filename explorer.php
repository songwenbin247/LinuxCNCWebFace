<?php

if ( $_SERVER['REQUEST_URI'] == '/' && !isset($_SERVER['HTTP_REFERER']) ) {
    if ( is_file('index.html') ) {
        print file_get_contents("index.html");
        exit;
    }
}




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
$archive_types = array('zip','cab','7z','gz','tar.bz2','tar.gz','tar','rar',);
$document_types = array('txt','text','doc','docx','abw','odt','pdf','rtf','tex','texinfo',);
$font_types = array('ttf','otf','abf','afm','bdf','bmf','fnt','fon','mgf','pcf','ttc','tfm','snf','sfd');

// Get the path (cut out the query string from the request_uri)
list($path) = explode('?', $_SERVER['REQUEST_URI']);

// Get the path that we're supposed to show.
$path = ltrim(rawurldecode($path), '/');

if(strlen($path) == 0) {
	$path = "./";
}




// Can't call the script directly since REQUEST_URI won't be a directory
if($_SERVER['PHP_SELF'] == '/'.$path) {
	die(lng('Unable to call')." " . $path . " ".lng('directly'));
}


// Make sure it is valid.
if(!is_dir($path)) {
	die("<b>" . $path . "</b> ".lng('is not a valid path'));
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
	global $image_types, $movie_types;
	
	$pos = strrpos($file, ".");
	if ($pos === false) {
		return lng("Unknown File");
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
	
	return(strtoupper($ext) . " " . $type);
}



// Print the heading stuff
$vpath = ($path != "./")?$path:"";
print "<html>
    <head>
        <meta charset='utf-8'>
		<title>".lng("Index of")." /" .$vpath. "</title>
        <link rel='stylesheet' href='/css/explorer.css' type='text/css' media='screen' />
        <script src='/js/explorer.js' type='text/javascript' ></script>
	</head>
	<body>
	<h2>".lng("Index of")." /" . $vpath ."</h2>
	<div class='list'>
	<table summary='".lng("Directory Listing")."' cellpadding='0' cellspacing='0'>";




// Get all of the folders and files. 
$folderlist = array();
$filelist = array();
if($handle = @opendir($path)) {
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
				'file_type' => lng("Directory")
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
	fclose($handle);
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
if($_GET['order']) {
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
$sort_methods['name'] = lng("Name");
$sort_methods['modtime'] = lng("Last Modified");
$sort_methods['size'] = lng("Size");
$sort_methods['file_type'] = lng("Type");

foreach($sort_methods as $key=>$item) {
	if($_GET['sort'] == $key) {
		print "<th class='n'><a href='?sort=$key$order'>$item</a></th>";
	} else {
		print "<th class='n'><a href='?sort=$key'>$item</a></th>";
	}
}
print "</tr></thead><tbody>";



// Parent directory link
if($path != "./") {
	print "<tr><td class='n'><a href='..'>".lng("Parent Directory")."</a>/</td>";
	print "<td class='m'>&nbsp;</td>";
	print "<td class='s'>&nbsp;</td>";
	print "<td class='t'>".lng("Directory")."</td></tr>";
}



// This simply creates an extra line for file/folder seperation
print "<tr><td colspan='4' style='height:7px;'></td></tr>";



// Print folder information
foreach($folderlist as $folder) {
	print "<tr><td class='n'><a class='folder' href='" . addslashes($folder['name']). "'>" .htmlentities($folder['name']). "</a>/</td>";
	print "<td class='m' title='" . date('H:i:s', $folder['modtime']) . "'>" . date('d.m.Y', $folder['modtime']) . "</td>";
	print "<td class='s'>" . (($calculate_folder_size)?format_bytes($folder['size'], 2):'--') . "&nbsp;</td>";
	print "<td class='t'>" . $folder['file_type']                    . "</td></tr>";
}



// This simply creates an extra line for file/folder seperation
print "<tr><td colspan='4' style='height:7px;'></td></tr>";



// Print file information
foreach($filelist as $file) {
	print "<tr><td class='n'><a class='file' href='" . addslashes($file['name']). "'>" .htmlentities($file['name']). "</a></td>";
	print "<td class='m' title='" . date('H:i:s', $file['modtime']) . "'>" . date('d.m.Y', $file['modtime'])   . "</td>";
	print "<td class='s'>" . format_bytes($file['size'],0)           . "&nbsp;</td>";
	print "<td class='t'>" . $file['file_type']                      . "</td></tr>";
}



// Print ending stuff
print "</tbody>
	</table>
	</div>
	</body>
	</html>";

?>
