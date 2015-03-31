/**
 * iFrame
 */

metaScore.namespace('editor.overlay').iFrame = (function () {

  function iFrame(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    iFrame.parent.call(this, this.configs);

    this.addClass('iframe');
  }

  iFrame.defaults = {
    /**
    * True to add a toolbar with title and close button
    */
    toolbar: true,

    /**
    * The iframe url
    */
    url: null
  };

  metaScore.editor.Overlay.extend(iFrame);

  iFrame.prototype.setupDOM = function(){
    // call parent method
    iFrame.parent.prototype.setupDOM.call(this);
    
    this.frame = new metaScore.Dom('<iframe/>', {'src': this.configs.url})
      .appendTo(this.contents);
  };

  return iFrame;

})();