(function ($) {

  Drupal.behaviors.metascore_editor = {
    attach: function (context, settings) {
    
      $('#editor-wrapper', context).once('metascore-editor', function(){
        metaScore.Editor.create(this);        
      });
      
    }
  };

})(jQuery);