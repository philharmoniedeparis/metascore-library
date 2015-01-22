/**
 * StyleSheet
 *
 * @requires ../metaScore.base.js
 */

metaScore.StyleSheet = (function () {

  function StyleSheet(configs) {
    this.configs = this.getConfigs(configs);

    // call the super constructor.
    metaScore.Dom.call(this, '<style/>', {'type': 'text/css'});
    
    this.el = this.get(0);

    // WebKit hack :(
    this.setInternalValue("");
  }

  metaScore.Dom.extend(StyleSheet);

  /**
  * Adds a CSS rule to the style sheet
  * @param {string} a selector on which the rule should apply
  * @param {string} the CSS rule(s)
  * @param {number} an optional index specifying the position to insert the new rule in
  * @returns {number} the index specifying the position in which the rule was inserted
  */
  StyleSheet.prototype.addRule = function(selector, rules, index) {
    var sheet = this.el.sheet;
    
    if(index === undefined){
      index = sheet.cssRules.length;
    }

    if("insertRule" in sheet) {
      return sheet.insertRule(selector + "{" + rules + "}", index);
    }
    else if("addRule" in sheet) {
      return sheet.addRule(selector, rules, index);
    }
  };

  /**
  * Removes a CSS rule from the style sheet
  * @param {number} the index specifying the position of the rule
  */
  StyleSheet.prototype.removeRule = function(index) {
    var sheet = this.el.sheet;
  
    if("deleteRule" in sheet) {
      sheet.deleteRule(index);
    }
    else if("removeRule" in sheet) {
      sheet.removeRule(index);
    }

    return this;
  };

  /**
  * Removes the first CSS rule that matches a selector
  * @param {string} the selector to match
  */
  StyleSheet.prototype.removeRulesBySelector = function(selector) {
    var sheet = this.el.sheet,
      rules = sheet.cssRules || sheet.rules;

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
    var sheet = this.el.sheet,
      rules = sheet.cssRules || sheet.rules;

    while(rules.length > 0){
      this.removeRule(0);
    }

    return this;
  };

  /**
  * Set the internal text value
  */
  StyleSheet.prototype.setInternalValue = function(value) {
    if(this.el.styleSheet){
      this.el.styleSheet.cssText = value;
    }
    else{
      this.text(value);
    }

    return this;
  };

  return StyleSheet;

})();