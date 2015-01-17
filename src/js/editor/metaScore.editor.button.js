/**
 * Button
 *
 * @requires ../helpers/metaScore.dom.js
 */

metaScore.namespace('editor').Button = (function () {

  function Button(configs) {
    this.configs = this.getConfigs(configs);

    // call the super constructor.
    metaScore.Dom.call(this, '<button/>');

    this.disabled = false;

    if(this.configs.label){
      this.setLabel(this.configs.label);
    }

    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
  }

  Button.defaults = {
    /**
    * A text to add as a label
    */
    label: null
  };

  metaScore.Dom.extend(Button);

  Button.prototype.onClick = function(evt){
    if(this.disabled){
      evt.stopPropagation();
    }
  };

  Button.prototype.setLabel = function(text){
    if(this.label === undefined){
      this.label = new metaScore.Dom('<span/>', {'class': 'label'})
        .appendTo(this);
    }

    this.label.text(text);

    return this;
  };

  /**
  * Disable the button
  * @returns {object} the XMLHttp object
  */
  Button.prototype.disable = function(){
    this.disabled = true;

    this.addClass('disabled');

    return this;
  };

  /**
  * Enable the button
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  Button.prototype.enable = function(){
    this.disabled = false;

    this.removeClass('disabled');

    return this;
  };

  return Button;

})();