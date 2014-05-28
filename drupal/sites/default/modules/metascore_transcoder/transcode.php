<?php

$input = $_REQUEST['input'];
$format = $_REQUEST['format'];

$output = isset($_REQUEST['output']) ? $_REQUEST['output'] : pathinfo($input, PATHINFO_DIRNAME) . DIRECTORY_SEPARATOR . pathinfo($input, PATHINFO_FILENAME) .'.'. $format;
$result = array();

$command = "ffmpeg -y -i {$input} ";

switch($format){
  case 'mp4':
    $command .= '-vcodec libx264 -pix_fmt yuv420p -profile:v baseline -preset slower -crf 18 -vf "scale=trunc(in_w/2)*2:trunc(in_h/2)*2"';
    break;
    
  case 'webm':
    $command .= '-c:v libvpx -c:a libvorbis -pix_fmt yuv420p -quality good -b:v 2M -crf 5';
    break;
}

$command .= " {$output} </dev/null >/dev/null 2>/var/log/ffmpeg.log &";

$command = escapeshellcmd($command);

print $command;

echo "Starting ffmpeg...\n\n";
echo shell_exec($command);
echo "Done.\n";