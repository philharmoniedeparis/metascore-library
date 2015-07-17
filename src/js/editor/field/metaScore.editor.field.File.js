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
      this.input.attr('accept', this.configs.accept);
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

    this.input
      .attr('type', 'file');

    this.current = new metaScore.Dom('<div/>')
      .appendTo(this.input_wrapper);
  };

  /**
   * Description
   * @method setValue
   * @param {} value
   * @return 
   */
  FileField.prototype.setValue = function(value){
    this.current.empty();
    
    if(value && ('name' in value) && ('url' in value)){
      new metaScore.Dom('<a/>', {'text': value.name})
        .attr('href', value.url)
        .attr('target', '_blank')
        .appendTo(this.current);
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