<?php

function _metascore_guide_services_definition() {

  $file = array(
    'module' => 'metascore_guide',
    'name' => 'metascore_guide.services',
    'type' => 'inc'
  );

  return array(
    'metascore_guide' => array(
      'index' => array(
        'help' => t('Lists guides'),
        'file' => $file,
        'callback' => '_metascore_guide_services_index',
        'args' => array(
        ),
        'access arguments' => array('access content'),
      ),
      'retrieve' => array(
        'help' => t('Retrieves a guide'),
        'file' => $file,
        'callback' => '_metascore_guide_services_retrieve',
        'args' => array(
          array(
            'name' => 'id',
            'description' => t('The id of the guide to retrieve'),
            'type' => 'int',
            'optional' => FALSE,
            'source' => array(
              'path' => '0'
            )
          ),
        ),
        'access callback' => '_metascore_guide_services_access',
        'access arguments' => array('update'),
        'access arguments append' => TRUE,
      ),
      'create' => array(
        'help' => t('Creates a new guide'),
        'file' => $file,
        'callback' => '_metascore_guide_services_create',
        'args' => array(
          array(
            'name' => 'title',
            'description' => 'The guide title',
            'type' => 'string',
            'optional' => FALSE,
            'source' => array(
              'data' => 'title'
            ),
          ),
          array(
            'name' => 'description',
            'description' => 'The guide description',
            'type' => 'string',
            'optional' => TRUE,
            'source' => array(
              'data' => 'description'
            ),
            'default value' => NULL,
          ),
          array(
            'name' => 'file',
            'description' => "The guide's media file contents encoded in Base64",
            'type' => 'struct',
            'optional' => FALSE,
            'source' => array(
              'data' => 'file'
            ),
          ),
          array(
            'name' => 'blocks',
            'description' => "The guide's html blocks",
            'type' => 'array',
            'optional' => TRUE,
            'source' => array(
              'data' => 'blocks'
            ),
            'default value' => array(),
          ),
        ),
        'access callback' => '_metascore_guide_services_access',
        'access arguments' => array('update'),
        'access arguments append' => TRUE,
      ),
      'update' => array(
        'help' => t('Updates a guide'),
        'file' => $file,
        'callback' => '_metascore_guide_services_update',
        'args' => array(
          array(
            'name' => 'id',
            'description' => 'The id of the guide to update',
            'type' => 'int',
            'optional' => FALSE,
            'source' => array(
              'path' => 0
            ),
          ),
          array(
            'name' => 'title',
            'description' => 'The guide title',
            'type' => 'string',
            'optional' => TRUE,
            'source' => array(
              'data' => 'title'
            ),
            'default value' => NULL,
          ),
          array(
            'name' => 'description',
            'description' => 'The guide description',
            'type' => 'string',
            'optional' => TRUE,
            'source' => array(
              'data' => 'description'
            ),
            'default value' => NULL,
          ),
          array(
            'name' => 'file',
            'description' => "The guide's media file contents encoded in Base64",
            'type' => 'struct',
            'optional' => TRUE,
            'source' => array(
              'data' => 'file'
            ),
            'default value' => NULL,
          ),
          array(
            'name' => 'blocks',
            'description' => "The guide's html blocks",
            'type' => 'array',
            'optional' => TRUE,
            'source' => array(
              'data' => 'blocks'
            ),
            'default value' => NULL,
          ),
        ),
        'access callback' => '_metascore_guide_services_access',
        'access arguments' => array('update'),
        'access arguments append' => TRUE,
      ),
      'delete' => array(
        'help' => t('Deletes a guide'),
        'file' => $file,
        'callback' => '_metascore_guide_services_delete',
        'args' => array(
          array(
            'name' => 'id',
            'description' => 'The id of the guide to delete',
            'type' => 'int',
            'optional' => FALSE,
            'source' => array(
              'path' => 0
            ),
          ),
        ),
        'access callback' => '_metascore_guide_services_access',
        'access arguments' => array('delete'),
        'access arguments append' => TRUE,
      ),
    ),
  );
}

/**
 * Retrieve a list of guides.
 *
 * @return array
 *    Decriptions of all corresponding Pois.
 */
function _metascore_guide_services_index() {

  $guides = array();

  $query = new EntityFieldQuery();  
  $query->entityCondition('entity_type', 'node')
      ->entityCondition('bundle', 'guide')
      ->propertyCondition('status', 1)
      ->propertyOrderBy('created', 'DESC');
  
  $query_result = $query->execute();

  if(isset($query_result['node'])){
    $ids = array_keys($query_result['node']);
    $nodes = entity_load('node', $ids);
    
    foreach($nodes as $node){
      $guides[] = _metascore_guide_services_get_node_info($node);
    }
  }
  
  return $guides;
}

/**
 * Retrieve a guide.
 *
 * @param $id
 *   The id of the guide to retrieve.
 *
 * @return array
 */
function _metascore_guide_services_retrieve($id) {

  if(($node = node_load($id)) && ($node->type == 'guide')){
    return _metascore_guide_services_get_node_info($node);
  }
  
  return services_error(t('Guide @id could not be found', array('@id' => $id)), 404);
  
}

/**
 * Create a new guide
 *
 * @param $group
 *   The organic group the Pois belong to.
 * @param $tag
 *   A tag id to filter the list with
 *
 * @return array
 */
function _metascore_guide_services_create($title, $description, $file, $blocks) {

  global $user;

  $guide_data = array(
    'type' => 'guide',
    'uid' => $user->uid,
    'title' => $title,
  );
  
  $file_contents = base64_decode(preg_replace('/^data:[a-z\/]*;base64,/', '', $file['contents']));
  $file_destination = file_default_scheme() .'://'. pathinfo($file['name'], PATHINFO_BASENAME);
  if($file_entity = file_save_data($file_contents, $file_destination)){
    $guide_data['field_guide_file'] = array(
      LANGUAGE_NONE => array(
        array(
          'fid' => $file_entity->fid,
          'display' => 1,
        ),
      ),
    );
  }
  else{
    return services_error(t('An error occured while creating the guide file'), 404);
  }
  
  if(!empty($description)){
    $guide_data['field_guide_description'] = array(
      LANGUAGE_NONE => array(
        array('value' => $description),
      ),
    );
  }
  
  if(!empty($blocks)){
    foreach($blocks as $delta => $block){
      $guide_data['field_guide_blocks'][LANGUAGE_NONE][$delta] = array(
        'value' => $block,
      );
    }
  }
  
  $entity = entity_create('node', $guide_data);
  
  return _metascore_guide_services_get_node_info($entity);

}

/**
 * Update a guide
 *
 *
 * @return array
 */
function _metascore_guide_services_update($id, $title, $description, $file, $blocks) {

  $entity = entity_load_single('node', $id);
  
  if(!is_null($title)){
    $entity->title = $title;
  }
  
  if(!is_null($description)){
    $entity->field_guide_description[LANGUAGE_NONE][0]['value'] = $description;
  }
  
  if(!empty($file)){
    $file_contents = base64_decode(preg_replace('/^data:[a-z\/]*;base64,/', '', $file['contents']));
    $file_destination = file_default_scheme() .'://'. pathinfo($file['name'], PATHINFO_BASENAME);
    if($file_entity = file_save_data($file_contents, $file_destination)){
      $entity->field_guide_file[LANGUAGE_NONE][0] = array(
        'fid' => $file_entity->fid,
        'display' => 1,
      );
    }
    else{
      return services_error(t('An error occured while creating the guide file'), 404);
    }
  }
  
  if(!is_null($blocks)){
    $entity->field_guide_blocks[LANGUAGE_NONE] = array();
  
    foreach($blocks as $delta => $block){
      $entity->field_guide_blocks[LANGUAGE_NONE][$delta]['value'] = $block;
    }
  }
  
  entity_save('node', $entity);
  
}

/**
 * Delete a guide.
 *
 * @param $group
 *   The organic group the Pois belong to.
 * 
 * @return array
 *    Array containing the id of the deleted POI.
 */
function _metascore_guide_services_delete($id) {

   return entity_delete('node', $id);
   
}

/**
 * Access callback
 *
 * @param $op
 *   One of view, update, create, delete per node_access().
 * @param $args
 *   Resource arguments passed through from the original request.
 * @return bool
 *
 * @see node_access()
 */
function _metascore_guide_services_access($op = 'view', $args = array()) {

  switch($op){      
    case 'create':
      return node_access($op, 'guide');
      
    default:
       if(!empty($args)){
        $id = $args[0];
      
        if(($node = node_load($id)) && $node->type == 'guide') {
          return node_access($op, $node);
        }
        else {
          return services_error(t('Guide @id could not be found', array('@id' => $id)), 404);
        }
    }
  }

}

/**
 * Helper function to return a guide details array.
 *
 * @param $node
 *   The guide entity
 *
 * @return array
*/
function _metascore_guide_services_get_node_info($node){

  $wrapper = entity_metadata_wrapper('node', $node);
  
  $info = array(
    'id' => intval($wrapper->getIdentifier()),
    'title' => $wrapper->label(),
    'description' => ($description = $wrapper->field_guide_description->value()) ? $description['value'] : NULL,
    'file' => _metascore_guide_services_get_file_info($wrapper->field_guide_file->value()),
    'transcoded_files' => array(),
    'blocks' => array(),
  );
  
  foreach($wrapper->field_guide_transcoded_files as $transcoded_file){
    $info['transcoded_files'][] = _metascore_guide_services_get_file_info($transcoded_file->value());
  }
  
  foreach($wrapper->field_guide_blocks as $block){
    $info['blocks'][] = $block->value();
  }
  
  return $info;

}

/**
 * Helper function to return a file details array.
 *
 * @param $file
 *   The file entity
 *
 * @return array
*/
function _metascore_guide_services_get_file_info($file) {

  $file = (object) $file;

  $wrapper = entity_metadata_wrapper('file', $file);

  return array(
    'id' => intval($wrapper->getIdentifier()),
    'name' => $wrapper->label(),
    'mime' => $wrapper->mime->value(),
    'url' => $wrapper->url->value(),
    'type' => $wrapper->type->value(),
    'size' => intval($wrapper->size->value()),
  );

}
