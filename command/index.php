<?php

// emulate random transfer time (:
usleep( mt_rand(500000,2000000) );




// get first line of the raw post data
$post = file_get_contents("php://input");
$post = trim ( 
    preg_replace( '#[\r\n].*$#m', '', $post ) 
);




function get_pos_str ( $coords = "XYZE", $prefix = '' )
{
    $pos = $prefix;
    if ( preg_match('/X/i', $coords) ) $pos .= ' X:'.mt_rand(-100,1500).'.'.mt_rand(0,9999);
    if ( preg_match('/Y/i', $coords) ) $pos .= ' Y:'.mt_rand(-100,3000).'.'.mt_rand(0,9999);
    if ( preg_match('/Z/i', $coords) ) $pos .= ' Z:'.mt_rand(-300,300).'.'.mt_rand(0,9999);
    if ( preg_match('/E/i', $coords) ) $pos .= ' E:'.mt_rand(-99999,99999).'.'.mt_rand(0,9999);
    return $pos;
}




$answer = 'ok';

if ( preg_match('#[a-z][a-z0-9_\-]+#', $post, $cmd) ) // console cmd
{
    switch  ( $cmd[0] ) {
        case 'get':
        {
            if ( preg_match('#(?:[^\w])pos(?:[^\w]|$)#', $post, $param_name) ) // get position
            {
                $answer =
                    get_pos_str('XYZ','last C:')."\n" .
                    get_pos_str('XYZ','realtime C:')."\n" .
                    get_pos_str('XYZ','MPOS:')."\n" .
                    get_pos_str('XYZ','APOS:')."\n" .
                    get_pos_str('XYZ','LMS:')."\n" .
                    get_pos_str('XYZ','LMP:')."\n"
                ;
            }
            else 
            {
                $answer = "error:unknown option ".$post."\n";
            }
            break;
        }
    }
} 
elseif ( preg_match('#G[0-9][0-9\.]+#', $post, $cmd) ) // G code
{
} 
elseif ( preg_match('#M[0-9][0-9\.]+#', $post, $cmd) ) // M code
{
    switch  ( $cmd[0] ) 
    {
        case 'M114': // get position
        {
            $answer .= ' '.get_pos_str('XYZE','C:');
            break;
        }
        case 'M114.1':
        {
            $answer .= ' '.get_pos_str('XYZ','C:');
            break;
        }
        case 'M114.2': 
        {
            $answer .= ' '.get_pos_str('XYZ','MPOS:');
            break;
        }
        case 'M114.3': 
        {
            $answer .= ' '.get_pos_str('XYZ','APOS:');
            break;
        }
        case 'M114.4': 
        {
            $answer .= ' '.get_pos_str('XYZ','LMS:');
            break;
        }
        case 'M114.5': 
        {
            $answer .= ' '.get_pos_str('XYZ','LMP:');
            break;
        }

        case 'M119': // get endstops states
        {
            $answer .=
                ' min_x:'.mt_rand(0,1).' min_y:'.mt_rand(0,1).' min_z:'.mt_rand(0,1).
                ' max_x:'.mt_rand(0,1).' max_y:'.mt_rand(0,1).' max_z:'.mt_rand(0,1)
            ;
            break;
        }

        case 'M957': // get spindle speed
        {
            $answer .= ' S:'.(mt_rand(-24,24)*1000);
            break;
        }
        case 'M960': // get/set VFD params/states
        {
            if ( preg_match('#P[0-9]+#', $post, $param_name) ) // params
            {
                if ( preg_match('#V[0-9]+#', $post, $param_value) ) // set param
                {
                }
                else // get param
                {
                    $answer .= ' '.$param_name[0].':'.mt_rand(0,9999);
                }
            }
            elseif ( preg_match('#S[0-9]+#', $post, $state_name) ) // states
            {
                $answer .= ' '.$state_name[0].':'.mt_rand(0,9999);
            }
            break;
        }
    }
} 
else 
{
}

print $answer;

?>