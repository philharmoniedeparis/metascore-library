/**
 * @module Core
 */

metaScore.StyleSheet = (function () {

    /**
     * A class for CSS style sheet manipulation
     * 
     * @class StyleSheet
     * @extends Dom
     * @constructor
     */
    function StyleSheet() {
        // call the super constructor.
        metaScore.Dom.call(this, '<style/>', {'type': 'text/css'});

        this.el = this.get(0);

        // WebKit hack
        this.setInternalValue("");
    }

    metaScore.Dom.extend(StyleSheet);

    /**
     * Add a CSS rule to the style sheet
     * 
     * @method addRule
     * @param {String} selector The CSS selector for the rule
     * @param {String} rule The style definitions for the rule
     * @param {Integer} [index] The index position of the rule
     * @chainable
     */
    StyleSheet.prototype.addRule = function(selector, rule, index) {
        var sheet = this.el.sheet;

        if(index === undefined){
            index = sheet.cssRules.length;
        }

        if("insertRule" in sheet) {
            sheet.insertRule(selector + "{" + rule + "}", index);
        }
        else if("addRule" in sheet) {
            sheet.addRule(selector, rule, index);
        }

        return this;
    };

    /**
     * Remove a CSS rule from the style sheet
     * 
     * @method removeRule
     * @param {Integer} The index position of the rule to remove
     * @chainable
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
     * Remove the first CSS rule that matches a selector
     * 
     * @method removeRulesBySelector
     * @param {String} selector The CSS selector of the rule to remove
     * @chainable
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
     * Remove all CSS rule from the style sheet
     * 
     * @method removeRules
     * @chainable
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
     * Set the internal text value of the style sheet
     * 
     * @method setInternalValue
     * @param {String} value The CSS rules
     * @chainable
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