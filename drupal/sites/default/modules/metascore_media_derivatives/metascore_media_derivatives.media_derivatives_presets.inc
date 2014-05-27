<?php
/**
 * @file
 * metascore_media_derivatives.media_derivatives_presets.inc
 */

/**
 * Implements hook_media_derivatives_presets().
 */
function metascore_media_derivatives_media_derivatives_presets() {
  $export = array();

  $preset = new stdClass();
  $preset->disabled = FALSE;
  $preset->api_version = 1;
  $preset->machine_name = 'video_mp4';
  $preset->engine = 'media_ffmpeg_simple';
  $preset->engine_settings = array(
    'ffmpeg_options' => '',
    'ffmpeg_out_options' => '-vcodec libx264 -pix_fmt yuv420p -profile:v baseline -preset slower -crf 18 -vf "scale=trunc(in_w/2)*2:trunc(in_h/2)*2"',
    'ffmpeg_extension' => 'mp4',
  );
  $preset->conditions = array(
    0 => 'file_type',
  );
  $preset->conditions_settings = array(
    'type' => 'video',
  );
  $preset->events = array(
    0 => 'field_presave',
  );
  $preset->events_settings = array(
    'field_presave_allowed_fields' => array(
      'field_guide_file' => 'field_guide_file',
    ),
  );
  $preset->scheduler = 'scheduler_immediate';
  $preset->scheduler_settings = array();
  $preset->settings = array(
    'recursive_delete' => 1,
    'delete_source' => 0,
    'user' => '0',
    'type' => '0',
  );
  $export['video_mp4'] = $preset;

  $preset = new stdClass();
  $preset->disabled = FALSE;
  $preset->api_version = 1;
  $preset->machine_name = 'video_webm';
  $preset->engine = 'media_ffmpeg_simple';
  $preset->engine_settings = array(
    'ffmpeg_options' => '',
    'ffmpeg_out_options' => '-c:v libvpx -c:a libvorbis -pix_fmt yuv420p -quality good -b:v 2M -crf 5',
    'ffmpeg_extension' => 'webm',
  );
  $preset->conditions = array(
    0 => 'file_type',
  );
  $preset->conditions_settings = array(
    'type' => 'video',
  );
  $preset->events = array(
    0 => 'field_presave',
  );
  $preset->events_settings = array(
    'field_presave_allowed_fields' => array(
      'field_guide_file' => 'field_guide_file',
    ),
  );
  $preset->scheduler = 'scheduler_immediate';
  $preset->scheduler_settings = array();
  $preset->settings = array(
    'recursive_delete' => 1,
    'delete_source' => 0,
    'user' => '0',
    'type' => '0',
  );
  $export['video_webm'] = $preset;

  $preset = new stdClass();
  $preset->disabled = FALSE;
  $preset->api_version = 1;
  $preset->machine_name = 'video_ogv';
  $preset->engine = 'media_ffmpeg_simple';
  $preset->engine_settings = array(
    'ffmpeg_options' => '',
    'ffmpeg_out_options' => '-q 5 -pix_fmt yuv420p -acodec libvorbis -vcodec libtheora',
    'ffmpeg_extension' => 'ogv',
  );
  $preset->conditions = array(
    0 => 'file_type',
  );
  $preset->conditions_settings = array(
    'type' => 'video',
  );
  $preset->events = array(
    0 => 'field_presave',
  );
  $preset->events_settings = array(
    'field_presave_allowed_fields' => array(
      'field_guide_file' => 'field_guide_file',
    ),
  );
  $preset->scheduler = 'scheduler_immediate';
  $preset->scheduler_settings = array();
  $preset->settings = array(
    'recursive_delete' => 1,
    'delete_source' => 0,
    'user' => '0',
    'type' => '0',
  );
  $export['video_ogv'] = $preset;

  $preset = new stdClass();
  $preset->disabled = FALSE;
  $preset->api_version = 1;
  $preset->machine_name = 'audio_mp3';
  $preset->engine = 'media_ffmpeg_simple';
  $preset->engine_settings = array(
    'ffmpeg_options' => '',
    'ffmpeg_out_options' => '-acodec libmp3lame -q:a 0 -map 0:a:0',
    'ffmpeg_extension' => 'mp3',
  );
  $preset->conditions = array(
    0 => 'file_type',
  );
  $preset->conditions_settings = array(
    'type' => 'audio',
  );
  $preset->events = array(
    0 => 'field_presave',
  );
  $preset->events_settings = array(
    'field_presave_allowed_fields' => array(
      'field_guide_file' => 'field_guide_file',
    ),
  );
  $preset->scheduler = 'scheduler_immediate';
  $preset->scheduler_settings = array();
  $preset->settings = array(
    'recursive_delete' => 1,
    'delete_source' => 0,
    'user' => '0',
    'type' => '0',
  );
  $export['audio_mp3'] = $preset;

  $preset = new stdClass();
  $preset->disabled = FALSE;
  $preset->api_version = 1;
  $preset->machine_name = 'audio_ogg';
  $preset->engine = 'media_ffmpeg_simple';
  $preset->engine_settings = array(
    'ffmpeg_options' => '',
    'ffmpeg_out_options' => '-acodec libvorbis -q:a 10 -map 0:a:0',
    'ffmpeg_extension' => 'ogg',
  );
  $preset->conditions = array(
    0 => 'file_type',
  );
  $preset->conditions_settings = array(
    'type' => 'audio',
  );
  $preset->events = array(
    0 => 'field_presave',
  );
  $preset->events_settings = array(
    'field_presave_allowed_fields' => array(
      'field_guide_file' => 'field_guide_file',
    ),
  );
  $preset->scheduler = 'scheduler_immediate';
  $preset->scheduler_settings = array();
  $preset->settings = array(
    'recursive_delete' => 1,
    'delete_source' => 0,
    'user' => '0',
    'type' => '0',
  );
  $export['audio_ogg'] = $preset;

  return $export;
}
