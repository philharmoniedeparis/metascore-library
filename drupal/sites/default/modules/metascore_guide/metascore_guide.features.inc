<?php
/**
 * @file
 * metascore_guide.features.inc
 */

/**
 * Implements hook_node_info().
 */
function metascore_guide_node_info() {
  $items = array(
    'guide' => array(
      'name' => t('Guide'),
      'base' => 'node_content',
      'description' => '',
      'has_title' => '1',
      'title_label' => t('Titre'),
      'help' => '',
    ),
  );
  return $items;
}
