<?php
/**
 * @file
 * metascore_media_derivatives.features.inc
 */

/**
 * Implements hook_ctools_plugin_api().
 */
function metascore_media_derivatives_ctools_plugin_api($module = NULL, $api = NULL) {
  if ($module == "media_derivatives" && $api == "media_derivatives_presets") {
    return array("version" => "1");
  }
}
