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
    this.updateFields();
    
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
    link: null,
    
    /**
    * A function to call when finished
    */
    sumbitCallback: metaScore.Function.emptyFn
  };
  
  metaScore.editor.Overlay.extend(LinkEditor);
  
  LinkEditor.prototype.setupUI = function(){
  
    var contents = this.getContents();
    
    this.fields = new metaScore.Dom('<div/>', {'class': 'fields'})
      .appendTo(contents);
    
    this.type = new metaScore.Dom('<div/>', {'class': 'field-wrapper type'})
      .appendTo(this.fields);
    this.type.label = new metaScore.Dom('<label/>', {'for': 'type', 'text': metaScore.String.t('Type')})
      .appendTo(this.type);
    this.type.field = new metaScore.editor.field.Select({
        options: {
          url: metaScore.String.t('URL'),
          page: metaScore.String.t('Page'),
          time: metaScore.String.t('Time'),
        }
      })
      .attr('id', 'type')
      .addListener('valuechange', metaScore.Function.proxy(this.onTypeChange, this))
      .appendTo(this.type);
    
    // URL
    this.urlwrapper = new metaScore.Dom('<div/>', {'class': 'url-wrapper'})
      .appendTo(this.fields);
    
    this.url = new metaScore.Dom('<div/>', {'class': 'field-wrapper url'})
      .appendTo(this.urlwrapper);
    this.url.label = new metaScore.Dom('<label/>', {'for': 'url', 'text': metaScore.String.t('URL')})
      .appendTo(this.url);
    this.url.field = new metaScore.editor.field.Text()
      .attr('id', 'url')
      .appendTo(this.url);
    
    // Page
    this.pagewrapper = new metaScore.Dom('<div/>', {'class': 'page-wrapper'})
      .appendTo(this.fields);
    
    this.page = new metaScore.Dom('<div/>', {'class': 'field-wrapper page'})
      .appendTo(this.pagewrapper);
    this.page.label = new metaScore.Dom('<label/>', {'for': 'page', 'text': metaScore.String.t('Page')})
      .appendTo(this.page);
    this.page.field = new metaScore.editor.field.Integer()
      .attr('id', 'page')
      .appendTo(this.page);
    
    // Time
    this.timewrapper = new metaScore.Dom('<div/>', {'class': 'page-wrapper'}).appendTo(this.fields);
    
    this.inTime = new metaScore.Dom('<div/>', {'class': 'field-wrapper inTime'})
      .appendTo(this.timewrapper);
    this.inTime.label = new metaScore.Dom('<label/>', {'for': 'inTime', 'text': metaScore.String.t('Start time')})
      .appendTo(this.inTime);
    this.inTime.field = new metaScore.editor.field.Time({
        outButton: false
      })
      .attr('id', 'inTime')
      .appendTo(this.inTime);
    
    this.outTime = new metaScore.Dom('<div/>', {'class': 'field-wrapper outTime'})
      .appendTo(this.timewrapper);
    this.outTime.label = new metaScore.Dom('<label/>', {'for': 'outTime', 'text': metaScore.String.t('End time')})
      .appendTo(this.outTime);
    this.outTime.field = new metaScore.editor.field.Time({
        outButton: false
      })
      .attr('id', 'outTime')
      .appendTo(this.outTime);
    
    this.rIndex = new metaScore.Dom('<div/>', {'class': 'field-wrapper rIndex'})
      .appendTo(this.timewrapper);
    this.rIndex.label = new metaScore.Dom('<label/>', {'for': 'rIndex', 'text': metaScore.String.t('Reading index')})
      .appendTo(this.rIndex);
    this.rIndex.field = new metaScore.editor.field.Integer()
      .attr('id', 'rIndex')
      .appendTo(this.rIndex);
    
    // Buttons      
    this.apply = new metaScore.editor.Button({'label': 'Apply'})
      .addClass('apply')
      .addListener('click', metaScore.Function.proxy(this.onApplyClick, this))
      .appendTo(contents);
      
    this.cancel = new metaScore.editor.Button({'label': 'Cancel'})
      .addClass('cancel')
      .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
      .appendTo(contents);
  
  };
  
  LinkEditor.prototype.setValuesFromLink = function(link){    
    var matches;
    
    if(!metaScore.Dom.is(link, 'a')){
      return;
    }
  
    if(matches = link.hash.match(/^#p=(\d+)/)){
      this.type.field.setValue('page');
      this.page.field.setValue(matches[1]);
    }
    else if(matches = link.hash.match(/^#t=(\d+),(\d+)&r=(\d+)/)){
      this.type.field.setValue('time');
      this.inTime.field.setValue(matches[1]);
      this.outTime.field.setValue(matches[2]);
      this.rIndex.field.setValue(matches[3]);
    }
    else{
      this.type.field.setValue('url');
      this.url.field.setValue(link.href);
    }
  };
  
  LinkEditor.prototype.updateFields = function(){
    var type = this.type.field.getValue();
    
    switch(type){
      case 'page':
        this.urlwrapper.hide();
        this.pagewrapper.show();
        this.timewrapper.hide();
        break;
        
      case 'time':
        this.urlwrapper.hide();
        this.pagewrapper.hide();
        this.timewrapper.show();
        break;
        
      default:
        this.urlwrapper.show();
        this.pagewrapper.hide();
        this.timewrapper.hide();
    }
  
  };
  
  LinkEditor.prototype.onTypeChange = function(evt){
    this.updateFields();
  };
  
  LinkEditor.prototype.onApplyClick = function(evt){
    var type = this.type.field.getValue(),
      url;
  
    switch(type){
      case 'page':
        url = '#p='+ this.page.field.getValue();
        break;
        
      case 'time':
        url = '#t='+ this.inTime.field.getValue() +','+ this.outTime.field.getValue();
        url = '&r='+ this.rIndex.field.getValue();
        break;
        
      default:
        url = this.url.field.getValue();
    }
    
    this.configs.sumbitCallback(url, this);
    
    this.hide();
  };
  
  LinkEditor.prototype.onCancelClick = function(evt){
    this.hide();
  };
    
  return LinkEditor;
  
})();