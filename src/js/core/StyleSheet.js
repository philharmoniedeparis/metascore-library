import Dom from './Dom';

export default class StyleSheet extends Dom {

    /**
     * A class for CSS style sheet manipulation
     *
     * @class StyleSheet
     * @extends Dom
     * @constructor
     */
    constructor() {
        // call the super constructor.
        super('<style/>', {'type': 'text/css'});

        this.el = this.get(0);

        // WebKit hack
        this.setInternalValue("");
    }

    /**
     * Add a CSS rule to the style sheet
     *
     * @method addRule
     * @param {String} selector The CSS selector for the rule
     * @param {String} rule The style definitions for the rule
     * @param {Integer} [index] The index position of the rule
     * @chainable
     */
    addRule(selector, rule, index) {
        let _index = index;
        const sheet = this.el.sheet;

        if(typeof _index === "undefined"){
            _index = sheet.cssRules.length;
        }

        if("insertRule" in sheet) {
            sheet.insertRule(`${selector}{${rule}}`, _index);
        }
        else if("addRule" in sheet) {
            sheet.addRule(selector, rule, _index);
        }

        return this;
    }

    /**
     * Remove a CSS rule from the style sheet
     *
     * @method removeRule
     * @param {Integer} The index position of the rule to remove
     * @chainable
     */
    removeRule(index) {
        const sheet = this.el.sheet;

        if("deleteRule" in sheet) {
            sheet.deleteRule(index);
        }
        else if("removeRule" in sheet) {
            sheet.removeRule(index);
        }

        return this;
    }

    /**
     * Remove the first CSS rule that matches a selector
     *
     * @method removeRulesBySelector
     * @param {String} selector The CSS selector of the rule to remove
     * @chainable
     */
    removeRulesBySelector(selector) {
        const sheet = this.el.sheet;
        const rules = sheet.cssRules || sheet.rules;
        const _selector = selector.toLowerCase();

        for (let i=0; i<rules.length; i++){
            if(rules[i].selectorText.toLowerCase() === _selector){
                this.removeRule(i);
                break;
            }
        }

        return this;
    }

    /**
     * Remove all CSS rule from the style sheet
     *
     * @method removeRules
     * @chainable
     */
    removeRules() {
        const sheet = this.el.sheet;
        const rules = sheet.cssRules || sheet.rules;

        while(rules.length > 0){
            this.removeRule(0);
        }

        return this;
    }

    /**
     * Set the internal text value of the style sheet
     *
     * @method setInternalValue
     * @param {String} value The CSS rules
     * @chainable
     */
    setInternalValue(value) {
        if(this.el.styleSheet){
            this.el.styleSheet.cssText = value;
        }
        else{
            this.text(value);
        }

        return this;
    }

}
