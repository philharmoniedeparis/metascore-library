/**
 * StyleSheet
 *
 * @requires ../metaScore.base.js
 */
 
metaScore.StyleSheet = (function () {
  
  function StyleSheet(configs) {
    this.configs = this.getConfigs(configs);
    
    // call the super constructor.
    metaScore.Dom.call(this, '<style/>', this.configs.attributes);
    
    // WebKit hack :(
    this.text("");
    
    this.appendTo(this.configs.container);
    
    this.sheet = this.get(0).sheet;
  }
  
  metaScore.Dom.extend(StyleSheet);
  
  StyleSheet.defaults = {
    /**
    * Defines the default document to add the sheet to
    */
    container: window.document.head,
    
    /**
    * Defines the default attributes
    */
    attributes: {}
  };

  /**
  * Adds a CSS rule to the style sheet
  * @param {string} a selector on which the rule should apply
  * @param {string} the CSS rule(s)
  * @param {number} an optional index specifying the position to insert the new rule in
  * @returns {number} the index specifying the position in which the rule was inserted
  */
  StyleSheet.prototype.addRule = function(selector, rules, index) {
    if(index === undefined){
      index = this.sheet.cssRules.length;
    }
  
    if("insertRule" in this.sheet) {
      return this.sheet.insertRule(selector + "{" + rules + "}", index);
    }
    else if("addRule" in this.sheet) {
      return this.sheet.addRule(selector, rules, index);
    }
  };

  /**
  * Removes a CSS rule from the style sheet
  * @param {number} the index specifying the position of the rule
  */
  StyleSheet.prototype.removeRule = function(index) {
    if("deleteRule" in this.sheet) {
      this.sheet.deleteRule(index);
    }
    else if("removeRule" in this.sheet) {
      this.sheet.removeRule(index);
    }
    
    return this;
  };

  /**
  * Removes the first CSS rule that matches a selector
  * @param {string} the selector to match
  */
  StyleSheet.prototype.removeRulesBySelector = function(selector) {
    var rules = this.sheet.cssRules || this.sheet.rules;
      
    selector = selector.toLowerCase();
  
    for (var i=0; i<rules.length; i++){
      if(rules[i].selectorText.toLowerCase() === selector){
        this.removeRule(i);
        break;
      }
    }
    
    return this;
  };

  /**
  * Removes all CSS rule from the style sheet
  */
  StyleSheet.prototype.removeRules = function() {
    var rules = this.sheet.cssRules || this.sheet.rules;
  
    while(rules.length > 0){
      this.removeRule(0);
    }
    
    return this;
  };
    
  return StyleSheet;
  
})();