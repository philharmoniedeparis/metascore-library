/**
 * LinkEditor
 *
 * @requires ../metaScore.editor.Ovelay.js
 * @requires ../../helpers/metaScore.ajax.js
 */
 
metaScore.namespace('editor.overlay').LinkEditor = (function () {
  
  function LinkEditor(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    LinkEditor.parent.call(this, this.configs);
    
    this.addClass('link-editor');
    
    this.setupUI();
    this.toggleFields();
    
    if(this.configs.link){
      this.setValuesFromLink(this.configs.link);
    }
  }

  LinkEditor.defaults = {    
    /**
    * True to add a toolbar with title and close button
    */
    toolbar: true,
    
    /**
    * The overlay's title
    */
    title: metaScore.String.t('Link editor'),
    
    /**
    * The current link
    */
    link: null
  };
  
  metaScore.editor.Overlay.extend(LinkEditor);
  
  LinkEditor.prototype.setupUI = function(){
  
    var contents = this.getContents();
    
    this.fields = {};    
    this.buttons = {};
    
    this.fields.type = new metaScore.editor.field.Select({
        label: metaScore.String.t('Type'),
        options: {
          url: metaScore.String.t('URL'),
          page: metaScore.String.t('Page'),
          time: metaScore.String.t('Time'),
        }
      })
      .addListener('valuechange', metaScore.Function.proxy(this.onTypeChange, this))
      .appendTo(contents);
    
    // URL
    this.fields.url = new metaScore.editor.field.Text({
        label: metaScore.String.t('URL')
      })
      .appendTo(contents);
    
    // Page
    this.fields.page = new metaScore.editor.field.Number({
        label: metaScore.String.t('Page')
      })
      .appendTo(contents);
    
    // Time
    this.fields.inTime = new metaScore.editor.field.Time({
        label: metaScore.String.t('Start time'),
        inButton: true
      })
      .appendTo(contents);
    
    this.fields.outTime = new metaScore.editor.field.Time({
        label: metaScore.String.t('End time'),
        inButton: true
      })
      .appendTo(contents);
    
    this.fields.rIndex = new metaScore.editor.field.Number({
        label: metaScore.String.t('Reading index')
      })
      .appendTo(contents);
    
    // Buttons      
    this.buttons.apply = new metaScore.editor.Button({'label': 'Apply'})
      .addClass('apply')
      .addListener('click', metaScore.Function.proxy(this.onApplyClick, this))
      .appendTo(contents);
      
    this.buttons.cancel = new metaScore.editor.Button({'label': 'Cancel'})
      .addClass('cancel')
      .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
      .appendTo(contents);
  
  };
  
  LinkEditor.prototype.setValuesFromLink = function(link){    
    var matches;
  
    if(matches = link.hash.match(/^#p=(\d+)/)){
      this.fields.type.setValue('page');
      this.fields.page.setValue(matches[1]);
    }
    else if(matches = link.hash.match(/^#t=(\d+),(\d+)&r=(\d+)/)){
      this.fields.type.setValue('time');
      this.fields.inTime.setValue(matches[1]);
      this.fields.outTime.setValue(matches[2]);
      this.fields.rIndex.setValue(matches[3]);
    }
    else{
      this.fields.type.setValue('url');
      this.fields.url.setValue(link.href);
    }
  };
  
  LinkEditor.prototype.toggleFields = function(){
    var type = this.fields.type.getValue();
    
    switch(type){
      case 'page':
        this.fields.url.hide();
        this.fields.page.show();
        this.fields.inTime.hide();
        this.fields.outTime.hide();
        this.fields.rIndex.hide();
        break;
        
      case 'time':
        this.fields.url.hide();
        this.fields.page.hide();
        this.fields.inTime.show();
        this.fields.outTime.show();
        this.fields.rIndex.show();
        break;
        
      default:
        this.fields.url.show();
        this.fields.page.hide();
        this.fields.inTime.hide();
        this.fields.outTime.hide();
        this.fields.rIndex.hide();
    }
  
  };
  
  LinkEditor.prototype.onTypeChange = function(evt){
    this.toggleFields();
  };
  
  LinkEditor.prototype.onApplyClick = function(evt){
    var type = this.fields.type.getValue(),
      url;
  
    switch(type){
      case 'page':
        url = '#p='+ this.fields.page.getValue();
        break;
        
      case 'time':
        url = '#t='+ this.fields.inTime.getValue() +','+ this.fields.outTime.getValue();
        url += '&r='+ this.fields.rIndex.getValue();
        break;
        
      default:
        url = this.fields.url.getValue();
    }
    
    this.triggerEvent('submit', {'overlay': this, 'url': url}, true, false);
    
    this.hide();
  };
  
  LinkEditor.prototype.onCancelClick = function(evt){
    this.hide();
  };
    
  return LinkEditor;
  
})();