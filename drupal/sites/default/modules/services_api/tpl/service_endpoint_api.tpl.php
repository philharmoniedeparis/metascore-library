<?php

print theme('table', array(
    'rows' => array(
        array(
            'base path',
            url($endpoint['path'], array('absolute' => true)),
        ),
        array(
            'formatters',
            implode(', ', array_keys(array_filter($endpoint['server_settings']['formatters']))),
        ),
        array(
            'parsers',
            implode(', ', array_keys(array_filter($endpoint['server_settings']['parsers']))),
        ),
    ),
));

foreach($resources as $key => $resource){
    
    $operations = array();
    $actions = array();
    
    if(isset($resource['endpoint']['operations'])){
        foreach(array_keys($resource['endpoint']['operations']) as $operation){
        
            if(!$resource['endpoint']['operations'][$operation]['enabled']){
                break;
            }
            
            switch($operation){
                case 'index':
                case 'retreive':
                    $method = 'GET';
                    break;
                case 'create':
                    $method = 'POST';
                    break;
                case 'update':
                    $method = 'PUT';
                    break;
                case 'delete':
                    $method = 'DELETE';
                    break;
                default:
                    $method = 'POST';
                    break;
            }
            
            $path = isset($resource['endpoint']['alias']) ? $resource['endpoint']['alias'] : $key;
            
            $path_args = array();
            if(isset($resource[$operation]['args'])){
                foreach($resource[$operation]['args'] as $arg){
                    if(isset($arg['source']['path'])){
                        $path_args[$arg['source']['path']] = $arg['name'];
                    }
                }
            }
            
            foreach($path_args as $path_arg){
                $path .= "/<span class='variable'>{{$path_arg}}</span>";
            }
            
            $path .= ".<span class='variable'>{format}</span>";
            
            $operations[] = array(
                'name' => $operation,
                'method' => $method,
                'args' => isset($resource[$operation]['args']) ? $resource[$operation]['args'] : array(),
                'help' => isset($resource[$operation]['help']) ? t($resource[$operation]['help']) : null,
                'path' => $path,
            );
        }
    }
    
    if(isset($resource['endpoint']['actions'])){
        foreach(array_keys($resource['endpoint']['actions']) as $action){
        
            if(!$resource['endpoint']['actions'][$action]['enabled']){
                break;
            }
            
            $path = isset($resource['endpoint']['alias']) ? $resource['endpoint']['alias'] : $key;
            
            $path .= '/'. $action;
            
            $path_args = array();
            if(isset($resource['actions'][$action]['args'])){
                foreach($resource['actions'][$action]['args'] as $arg){
                    if(isset($arg['source']['path'])){
                        $path_args[$arg['source']['path']] = $arg['name'];
                    }
                }
            }
            
            foreach($path_args as $path_arg){
                $path .= "/<span class='variable'>{{$path_arg}}</span>";
            }
            
            $path .= ".<span class='variable'>{format}</span>";
            
            $actions[] = array(
                'name' => $action,
                'method' => 'POST',
                'args' => isset($resource['actions'][$action]['args']) ? $resource['actions'][$action]['args'] : array(),
                'help' => isset($resource['actions'][$action]['help']) ? t($resource['actions'][$action]['help']) : null,
                'path' => $path,
            );
        }
    }
        
    if(!empty($operations) || !empty($actions)){
        
        print "<h2>{$key}</h2>";
        
    }
        
    if(!empty($operations)){
        
        print "<h3>". t('operations') ."</h3>";
        
        $rows = array();
        
        foreach($operations as $operation){
        
            $rows[] = array(
                $operation['name'],
                $operation['method'],
                $operation['help'],
                $operation['path'],
            );
            
            if(!empty($operation['args'])){
                $args_rows = array();
        
                foreach($operation['args'] as $arg){
                    $args_rows[] = array(
                        $arg['name'],
                        $arg['type'],
                        is_array($arg['source']) ? key($arg['source']) .'&nbsp;"'. current($arg['source']) .'"' : $arg['source'],
                        $arg['optional'] ? t('true') : t('false'),
                        $arg['description'],
                    );
                }
                
                if(!empty($args_rows)){
                    $args_table = theme('table', array(
                        'header' => array(
                            t('arg'),
                            t('type'),
                            t('source'),
                            t('optional'),
                            t('description'),
                        ),
                        'rows' => $args_rows,
                    ));
                
                    $rows[] = array(
                        array(
                            'data' => $args_table,
                            'colspan' => 4,
                        ),
                    );
                }
            }
            
        }
        
        print theme('table', array(
            'header' => array(
                t('name'),
                t('method'),
                t('description'),
                t('path'),
            ),
            'rows' => $rows,
        ));
    }
        
    if(!empty($actions)){
        
        print "<h3>". t('actions') ."</h3>";
        
        $rows = array();
        
        foreach($actions as $action){
        
            $rows[] = array(
                $action['name'],
                $action['method'],
                $action['help'],
                $action['path'],
            );
            
            if(!empty($action['args'])){
                $args_rows = array();
        
                foreach($action['args'] as $arg){
                    $args_rows[] = array(
                        $arg['name'],
                        $arg['type'],
                        is_array($arg['source']) ? key($arg['source']) .'&nbsp;"'. current($arg['source']) .'"' : $arg['source'],
                        $arg['optional'] ? t('true') : t('false'),
                        $arg['description'],
                    );
                }
                
                if(!empty($args_rows)){
                    $args_table = theme('table', array(
                        'header' => array(
                            t('arg'),
                            t('type'),
                            t('source'),
                            t('optional'),
                            t('description'),
                        ),
                        'rows' => $args_rows,
                    ));
                
                    $rows[] = array(
                        array(
                            'data' => $args_table,
                            'colspan' => 4,
                        ),
                    );
                }
            }
            
        }
        
        print theme('table', array(
            'header' => array(
                t('name'),
                t('method'),
                t('description'),
                t('path'),
            ),
            'rows' => $rows,
        ));
    }
}
