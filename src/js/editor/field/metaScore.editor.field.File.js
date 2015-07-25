/**
* Description
* @class File
* @namespace metaScore.editor.field
* @extends metaScore.editor.Field
*/

metaScore.namespace('editor.field').File = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function FileField(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    FileField.parent.call(this, this.configs);
    
    if(this.configs.accept){
      this.setAcceptedTypes(this.configs.accept);
    }

    this.addClass('filefield');
  }

  FileField.defaults = {
    'accept': null
  };

  metaScore.editor.Field.extend(FileField);

  /**
   * Description
   * @method setupUI
   * @return 
   */
  FileField.prototype.setupUI = function(){
    FileField.parent.prototype.setupUI.call(this);

    this.input.attr('type', 'file');

    this.current = new metaScore.Dom('<div/>')
      .appendTo(this.input_wrapper);
  };

  /**
   * Description
   * @method setAcceptedTypes
   * @param {} types
   * @return 
   */
  FileField.prototype.setAcceptedTypes = function(types){
    this.input.attr('accept', types);
  };

  /**
   * Description
   * @method setValue
   * @param {} value
   * @return 
   */
  FileField.prototype.setValue = function(value){
    var info;
  
    this.current.empty();
    
    this.input.val('');
    
    if(value && ('name' in value)){
      info = new metaScore.Dom('<a/>', {'text': value.name})
        .attr('target', '_blank')
        .appendTo(this.current);
        
      if('url' in value){
        info.attr('href', value.url);
      }
    }
  };

  /**
   * Description
   * @method getFile
   * @param File or FileList file
   * @return 
   */
  FileField.prototype.getFile = function(index){
    var files = this.input.get(0).files;
  
    if(index !== undefined){
      return files[index];
    }
    
    return files;
  };

  return FileField;

})();