/**
* Description
* @class StyleSheet
* @extends Dom
*/

metaScore.StyleSheet = (function () {

    /**
     * Description
     * @constructor
     * @param {} configs
     */
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
     * @method addRule
     * @param {} selector
     * @param {} rules
     * @param {} index
     * @return 
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
     * @method removeRule
     * @param {} index
     * @return ThisExpression
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
     * @method removeRulesBySelector
     * @param {} selector
     * @return ThisExpression
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
     * @method removeRules
     * @return ThisExpression
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
     * @method setInternalValue
     * @param {} value
     * @return ThisExpression
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