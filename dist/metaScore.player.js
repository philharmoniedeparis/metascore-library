/*! metaScore - v0.9.1 - 2016-05-02 - Oussama Mubarak */
;(function (global) {
"use strict";


/**
 * Polyfills
 */

// Element.matches
if(Element && !Element.prototype.matches){
    Element.prototype.matches = Element.prototype.matchesSelector =
        Element.prototype.matchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        function (selector){
            var element = this,
                matches = (element.document || element.ownerDocument).querySelectorAll(selector),
                i = 0;

            while (matches[i] && matches[i] !== element) {
                i++;
            }

            return matches[i] ? true : false;
        };
}

// Element.closest
if(Element && !Element.prototype.closest){
    Element.prototype.closest = function closest(selector){
        var node = this;

        while(node){
            if(node.matches(selector)){
                return node;
            }
            else{
                node = node.parentElement;
            }
        }

        return null;
    };
}

// CustomEvent constructor
// https://github.com/krambuhl/custom-event-polyfill/blob/master/custom-event-polyfill.js
if(!window.CustomEvent || typeof window.CustomEvent !== 'function'){
    window.CustomEvent = function(event, params){
        var evt;

        params = params || {
            bubbles: false,
            cancelable: false,
            detail: undefined
        };

        evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

        return evt;
    };

    window.CustomEvent.prototype = window.Event.prototype;
}


// requestAnimationFrame
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function(){
    var lastTime = 0,
        vendors = ['ms', 'moz', 'webkit', 'o'];
        
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if(!window.requestAnimationFrame){
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if(!window.cancelAnimationFrame){
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());
/**
 * The Core module defines shared classes used in other modules
 *
 * @module Core
 * @main
 */
 
 /**
 * The core global object to which all internal classes are attached<br/>
 *
 * @class metaScore
 * @static
 */
var metaScore = {

    /**
     * Returns the current version identifier
     *
     * @method getVersion
     * @static
     * @return {String} The version identifier
     */
    getVersion: function(){
        return "0.9.1";
    },

    /**
     * Returns the current revision identifier
     *
     * @method getRevision
     * @static
     * @return {String} The revision identifier
     */
    getRevision: function(){
        return "16bab3";
    },

    /**
     * Returns a sub-namespace, creating it if it doesn't already exist
     *
     * @method namespace
     * @static
     * @param {String} The sub-namespace to create
     * @return {Object} The sub-namespace
     */
    namespace: function(str){
        var parent = this,
            parts = str.split('.'),
            part;

        for(var i = 0, length = parts.length; i < length; i++) {
            part = parts[i];
            parent[part] = parent[part] || {};
            parent = parent[part];
        }

        return parent;
    }

};
/**
 * @module Core
 */

metaScore.Class = (function(){

    /**
     * The base class <br/>
     * Implements a class extension mechanism and defines shared methods
     *
     * @class Class
     * @constructor
     */
    function Class(){
    }

    /**
     * Default config values
     *
     * @property defaults
     * @type Object
     * @default {}
     */
    Class.defaults = {};

    /**
     * Extends a class using the current one
     *
     * @method extend
     * @param {Class} child The child class to extend
     */
    Class.extend = function(child){
        child.prototype = Object.create(this.prototype, {
            constructor: {
                value: child
            }
        });

        child.parent = this;
        child.extend = this.extend;

        if(!('defaults' in child)){
            child.defaults = {};
        }

        for(var prop in this.defaults){
            if(!(prop in child.defaults)){
                child.defaults[prop] = this.defaults[prop];
            }
        }
    };

    /**
     * Returns a configs object by overriding the defaults with custom ones
     *
     * @method getConfigs
     * @param {Object} configs The custom configs
     * @return {Object} The extended configs
     */
    Class.prototype.getConfigs = function(configs){
        configs = configs || {};

        for(var prop in this.constructor.defaults){
            if(!(prop in configs)){
                configs[prop] = this.constructor.defaults[prop];
            }
        }

        return configs;
    };

    return Class;

})();
/**
 * @module Core
 */

metaScore.Evented = (function(){

    /**
     * A base class for event handling
     *
     * @class Evented
     * @extends Class
     * @constructor
     */
    function Evented() {
        // call parent constructor
        Evented.parent.call(this);

        this.listeners = {};
    }

    metaScore.Class.extend(Evented);

    /**
     * Add an event listener
     *
     * @method addListener
     * @param {String} type The event type to listen to
     * @param {Function} listener The callback function to associate to this listener
     * @chainable
     */
    Evented.prototype.addListener = function(type, listener){
        if (typeof this.listeners[type] === "undefined"){
            this.listeners[type] = [];
        }

        this.listeners[type].push(listener);

        return this;
    };

    /**
     * Remove an event listener
     *
     * @method removeListener
     * @param {String} type The event type to stop listen to
     * @param {Function} listener The callback function associated to this listener
     * @chainable
     */
    Evented.prototype.removeListener = function(type, listener){
        if(this.listeners[type] instanceof Array){
            var listeners = this.listeners[type];
            for (var i=0, len=listeners.length; i < len; i++){
                if (listeners[i] === listener){
                    listeners.splice(i, 1);
                    break;
                }
            }
        }

        return this;
    };

    /**
     * Check if a listener is attached to a given event type
     *
     * @method hasListener
     * @param {String} type The event type
     * @return {Boolean} Whether a listener is attached
     */
    Evented.prototype.hasListener = function(type){
        if(this.listeners[type] instanceof Array){
            return this.listeners[type].length > 0;
        }

        return false;
    };

    /**
     * Trigger an event
     *
     * @method triggerEvent
     * @param {String} type The event type
     * @param {Mixed} data Data to attach to the event via the detail propoerty
     * @param {Boolean} bubbling Whether the event bubbles up through the DOM or not
     * @param {Boolean} cancelable Whether the event is cancelable or not
     * @chainable
     */
    Evented.prototype.triggerEvent = function(type, data, bubbling, cancelable){
        var listeners, event;

        if (this.listeners[type] instanceof Array){
            listeners = this.listeners[type];

            event = {
                'target': this,
                'type': type,
                'detail': data,
                'bubbles': bubbling !== false,
                'cancelable': cancelable !== false
            };

            metaScore.Object.each(listeners, function(index, listener){
                listener.call(this, event);
            }, this);
        }

        return this;
    };

    return Evented;

})();
/**
 * @module Core
 */

metaScore.Dom = (function () {

    /**
     * Fired before an element is removed
     *
     * @event beforeremove
     */
    var EVT_BEFOREREMOVE = 'beforeremove';

    /**
     * Fired when a child element is removed
     *
     * @event childremove
     * @param {Object} child The removed child
     */
    var EVT_CHILDREMOVE = 'childremove';

    /**
     * A class for Dom manipulation
     * 
     * @class Dom
     * @extends Class
     * @constructor
     * @param {Mixed} [...args] An HTML string and an optional list of attributes to apply, or a CSS selector with an optional parent and an optional list of attributes to apply
     * 
     * @example
     *     var div = new metaScore.Dom('<div/>', {'class': 'my-class'});
     *     var body = new metaScore.Dom('body');
     */
    function Dom() {
        var elements;

        this.elements = [];

        if(arguments.length > 0){
            if(elements = metaScore.Dom.elementsFromString.apply(this, arguments)){
                this.add(elements);

                if(arguments.length > 1){
                    this.attr(arguments[1]);
                }
            }
            else if(elements = metaScore.Dom.selectElements.apply(this, arguments)){
                this.add(elements);

                if(arguments.length > 2){
                    this.attr(arguments[2]);
                }
            }
        }
    }

    metaScore.Class.extend(Dom);

    /**
     * Regular expression that matches dashed string for camelizing
     *
     * @property camelRe
     * @private
     */
    Dom.camelRe = /-([\da-z])/gi;

    /**
     * List of common events that should generaly bubble up
     * 
     * @property bubbleEvents
     * @static
     * @private
     */
    Dom.bubbleEvents = {
        'click': true,
        'submit': true,
        'mousedown': true,
        'mousemove': true,
        'mouseup': true,
        'mouseover': true,
        'mouseout': true,
        'transitionend': true
    };

    /**
     * Helper function used by the camel function
     * 
     * @method camelReplaceFn
     * @static
     * @private
     * @param {The matched substring} match
     * @param {The submatched letter} letter
     * @return {String} The uppercased letter
     */
    Dom.camelReplaceFn = function(match, letter) {
        return letter.toUpperCase();
    };

    /**
     * Normalize a string to Camel Case
     * 
     * @method camel
     * @static
     * @private
     * @param {String} str The string to normalize
     * @return {String} The normalized string
     */
    Dom.camel = function(str){
        return str.replace(Dom.camelRe, Dom.camelReplaceFn);
    };

    /**
     * Select a single element by CSS selecor and optional parent
     * 
     * @method selectElement
     * @static
     * @param {String} The CSS selector
     * @param {HTMLElement} [parent=document] The HTML Element in which to search
     * @return {HTMLElement} The found element if any
     */
    Dom.selectElement = function (selector, parent) {
        var element;

        if(!parent){
            parent = document;
        }

        if (metaScore.Var.is(selector, 'string')) {
            element = parent.querySelector(selector);
        }
        else if (selector.length) {
            element = selector[0];
        }
        else {
            element = selector;
        }

        return element;
    };

    /**
     * Select multiple elements by CSS selecor and optional parent
     * 
     * @method selectElements
     * @static
     * @param {String} The CSS selector
     * @param {HTMLElement} [parent=document] The HTML Element in which to search
     * @return {Mixed} An HTML NodeList or an array of found elements if any
     */
    Dom.selectElements = function (selector, parent) {
        var elements;

        if(selector !== undefined){
            if(!parent){
                parent = document;
            }
            else if(parent instanceof Dom){
                parent = parent.get(0);
            }

            if(metaScore.Var.is(selector, 'string')) {
                elements = parent.querySelectorAll(selector);
            }
            else if('length' in selector) {
                elements = selector;
            }
            else {
                elements = [selector];
            }
        }

        return elements;
    };

    /**
     * Creates elements from an HTML string (see http://krasimirtsonev.com/blog/article/Revealing-the-magic-how-to-properly-convert-HTML-string-to-a-DOM-element)
     * 
     * @method elementsFromString
     * @static
     * @param {String} html The HTML string
     * @return {HTML NodeList} A NodeList of the created elements, or null on error
     */
    Dom.elementsFromString = function(html){
        var wrapMap = {
                'option': [1, "<select multiple='multiple'>", "</select>"],
                'optgroup': [1, "<select multiple='multiple'>", "</select>"],
                'legend': [1, "<fieldset>", "</fieldset>"],
                'area': [1, "<map>", "</map>"],
                'param': [1, "<object>", "</object>"],
                'thead': [1, "<table>", "</table>"],
                'tbody': [1, "<table>", "</table>"],
                'tfoot': [1, "<table>", "</table>"],
                'colgroup': [1, "<table>", "</table>"],
                'caption': [1, "<table>", "</table>"],
                'tr': [2, "<table><tbody>", "</tbody></table>"],
                'col': [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
                'th': [3, "<table><tbody><tr>", "</tr></tbody></table>"],
                'td': [3, "<table><tbody><tr>", "</tr></tbody></table>"],
                '_default': [1, "<div>", "</div>" ]
            },
            element = document.createElement('div'),
            match = /<\s*\w.*?>/g.exec(html),
            tag, map, j;

        if(match != null){
            tag = match[0].replace(/</g, '').replace(/\/?>/g, '');

            map = wrapMap[tag] || wrapMap['_default'];
            html = map[1] + html + map[2];
            element.innerHTML = html;

            // Descend through wrappers to the right content
            j = map[0];
            while(j--) {
                element = element.lastChild;
            }

            return element.childNodes;
        }

        return null;
    };

    /**
     * Get the window containing an element
     * 
     * @method getElementWindow
     * @static
     * @param {HTMLElement} element The element
     * @return {HTML Window} The window
     */
    Dom.getElementWindow = function(element){
        var doc = element.ownerDocument;

        return doc.defaultView || doc.parentWindow;
    };

    /**
     * Check if an element has a given CSS lass
     * 
     * @method hasClass
     * @static
     * @param {HTMLElement} element The element
     * @param {String} className The CSS class
     * @return {Boolean} Whether the element has the specified CSS class
     */
    Dom.hasClass = function(element, className){
        return element.classList.contains(className);
    };

    /**
     * Add a CSS class to an element
     * 
     * @method addClass
     * @static
     * @param {HTMLElement} element The element
     * @param {String} className The CSS class
     */
    Dom.addClass = function(element, className){
        var classNames = className.split(" "),
            i = 0, l = classNames.length;

        for(; i<l; i++){
            element.classList.add(classNames[i]);
        }
    };

    /**
     * Remove a CSS class from an element
     * 
     * @method removeClass
     * @static
     * @param {HTMLElement} element The element
     * @param {String} className The CSS class
     */
    Dom.removeClass = function(element, className){
        var classNames = className.split(" "),
            i = 0, l = classNames.length;

        for(; i<l; i++){
            element.classList.remove(classNames[i]);
        }
    };

    /**
     * Toggle a CSS class on an element
     * 
     * @method toggleClass
     * @static
     * @param {HTMLElement} element The element
     * @param {String} className The CSS class
     * @param {Boolean} [force] Whether to add or remove the class. The class is toggled if not specified
     */
    Dom.toggleClass = function(element, className, force){
        var classNames = className.split(" "),
            i = 0, l = classNames.length;

        if(force === undefined){
            for(; i<l; i++){
                element.classList.toggle(classNames[i]);
            }
        }
        // avoid using classList.toggle with a second argument due to a bug in IE 11
        else if(force){
            Dom.addClass(element, className);
        }
        else{
            Dom.removeClass(element, className);
        }
    };

    /**
     * Add an event listener on an element
     * 
     * @method addListener
     * @static
     * @param {HTMLElement} element The element
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @return {HTMLElement} The element
     */
    Dom.addListener = function(element, type, callback, useCapture){
        if(useCapture === undefined){
            useCapture = ('type' in Dom.bubbleEvents) ? Dom.bubbleEvents[type] : false;
        }

        element.addEventListener(type, callback, useCapture);

        return element;
    };

    /**
     * Remove an event listener from an element
     * 
     * @method removeListener
     * @static
     * @param {HTMLElement} element The element
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @return {HTMLElement} The element
     */
    Dom.removeListener = function(element, type, callback, useCapture){
        if(useCapture === undefined){
            useCapture = ('type' in Dom.bubbleEvents) ? Dom.bubbleEvents[type] : false;
        }

        element.removeEventListener(type, callback, useCapture);

        return element;
    };

    /**
     * Trigger an event from an element
     * 
     * @method triggerEvent
     * @static
     * @param {HTMLElement} element The element
     * @param {String} type The event type
     * @param {Object} [data] Custom data to send with the event. The data is accessible through the event.detail property
     * @param {Boolean} [bubbles=true] Whether the event bubbles up through the DOM or not
     * @param {Boolean} [cancelable=true] Whether the event is cancelable
     * @return {Boolean} Whether the event was not cancelled
     */
    Dom.triggerEvent = function(element, type, data, bubbles, cancelable){
        var fn = CustomEvent || Dom.getElementWindow(element).CustomEvent;

        var event = new fn(type, {
            'detail': data,
            'bubbles': bubbles !== false,
            'cancelable': cancelable !== false
        });

        return element.dispatchEvent(event);
    };

    /**
     * Set or get the innerHTML of an element
     * 
     * @method text
     * @static
     * @param {HTMLElement} element The element
     * @param {String} [html] The value to set
     * @return {String} The innerHTML of the element
     */
    Dom.text = function(element, html){
        if(html !== undefined){
            element.innerHTML = html;
        }

        return element.innerHTML;
    };

    /**
     * Set or get the value of an element
     * 
     * @method val
     * @static
     * @param {HTMLElement} element The element
     * @param {String} [value] The value to set
     * @return {String} The value of the element
     */
    Dom.val = function(element, value){
        var options, values;
        
        if(Dom.is(element, 'select[multiple]')){
            if(value){
                if(!metaScore.Var.is(value, 'array')){
                    value = [value];
                }
                
                options = Dom.selectElements('option', element);
                
                metaScore.Array.each(options, function(index, option){
                    Dom.prop(option, 'selected', metaScore.Array.inArray(Dom.val(option), value) > -1);
                });
            }
            
            options = Dom.selectElements('option:checked', element);
            values = [];
            
            metaScore.Array.each(options, function(index, option){
                values.push(Dom.val(option));
            });
            
            return values;
        }        
        else{
            if(value !== undefined){
                element.value = value;
            }

            return element.value;
        }
    };

    /**
     * Set or get an attribute on an element
     * 
     * @method attr
     * @static
     * @param {HTMLElement} element The element
     * @param {Mixed} name The attribute's name, or a list of name/value pairs
     * @param {Mixed} [value] The attribute's value
     * @return {Mixed} The attribute's value, nothing is returned for 'special' attributes such as "class" or "text"
     */
    Dom.attr = function(element, name, value){
        if(metaScore.Var.is(name, 'object')){
            metaScore.Object.each(name, function(key, value){
                Dom.attr(element, key, value);
            }, this);
        }
        else{
            switch(name){
                case 'class':
                    this.addClass(element, value);
                    break;

                case 'text':
                    this.text(element, value);
                    break;

                default:
                    if(value === null){
                        element.removeAttribute(name);
                    }
                    else{
                        if(value !== undefined){
                            element.setAttribute(name, value);
                        }

                        return element.getAttribute(name);
                    }
                    break;
            }
        }
    };

    /**
     * Set or get a property on an element
     * 
     * @method prop
     * @static
     * @param {HTMLElement} element The element
     * @param {Mixed} name The attribute's name, or a list of name/value pairs
     * @param {Mixed} [value] The attribute's value
     * @return {Mixed} The attribute's value, nothing is returned for 'special' attributes such as "class" or "text"
     */
    Dom.prop = function(element, name, value){
        if(metaScore.Var.is(name, 'object')){
            metaScore.Object.each(name, function(key, value){
                Dom.prop(element, key, value);
            }, this);
        }
        else{
            if(value === null){
                try {
                    element[name] = undefined;
                    delete element[name];
                }catch(e){
                }
            }
            else{
                if(value !== undefined){
                    element[name] = value;
                }
                
                return element[name];
            }
        }
    };

    /**
     * Set or get a CSS style property of an element
     * 
     * @method css
     * @static
     * @param {HTMLElement} element The element
     * @param {String} name The CSS property's name
     * @param {String} value The CSS property's value
     * @param {Boolean} [inline=false] Whether to return the inline or computed style value
     * @return {String} The CSS style value of the property
     */
    Dom.css = function(element, name, value, inline){
        var camel, style;

        camel = this.camel(name);

        if(value !== undefined){
            element.style[camel] = value;
        }

        style = inline === true ? element.style : window.getComputedStyle(element);

        return style.getPropertyValue(name);
    };

    /**
     * Set or get a custom data attribute of an element
     * 
     * @method data
     * @static
     * @param {HTMLElement} element The element
     * @param {String} name The name of the data attribute
     * @param {String} value The value of the data attribute
     * @return {String} The value of the data attribute
     */
    Dom.data = function(element, name, value){
        name = this.camel(name);

        if(value === null){
            if(element.dataset[name]){
                delete element.dataset[name];
            }
        }
        else if(value !== undefined){
            element.dataset[name] = value;
        }

        return element.dataset[name];
    };

    /**
     * Append children to an element
     * 
     * @method append
     * @static
     * @param {HTMLElement} element The element
     * @param {Mixed} children An array of elemets or a single element to append
     */
    Dom.append = function(element, children){
        if (!metaScore.Var.is(children, 'array')) {
            children = [children];
        }

        metaScore.Array.each(children, function(index, child){
            element.appendChild(child);
        }, this);
    };

    /**
     * Insert siblings before an element
     * 
     * @method before
     * @static
     * @param {HTMLElement} element The element
     * @param {Mixed} siblings An array of elemets or a single element to insert
     */
    Dom.before = function(element, siblings){
        if (!metaScore.Var.is(siblings, 'array')) {
            siblings = [siblings];
        }

        metaScore.Array.each(siblings, function(index, sibling){
            element.parentElement.insertBefore(sibling, element);
        }, this);
    };

    /**
     * Insert siblings after an element
     * @method after
     * @static
     * @param {HTMLElement} element The element
     * @param {Mixed} siblings An array of elemets or a single element to insert
     */
    Dom.after = function(element, siblings){
        if (!metaScore.Var.is(siblings, 'array')) {
            siblings = [siblings];
        }

        metaScore.Array.each(siblings, function(index, sibling){
            element.parentElement.insertBefore(sibling, element.nextSibling);
        }, this);
    };

    /**
     * Remove all element children
     * 
     * @method empty
     * @static
     * @param {HTMLElement} element The element
     */
    Dom.empty = function(element){
        while(element.firstChild){
            element.removeChild(element.firstChild);
        }
    };

    /**
     * Remove an element from the DOM
     * 
     * @method remove
     * @static
     * @param {HTMLElement} element The element
     */
    Dom.remove = function(element){
        if(element.parentElement){
            element.parentElement.removeChild(element);
        }
    };

    /**
     * Check if an element matches a CSS selector
     * 
     * @method is
     * @static
     * @param {HTMLElement} element The element
     * @param {String} selector The CSS selector
     * @return {Boolean} Whether the element matches the CSS selector
     */
    Dom.is = function(element, selector){
        var win;

        if(element instanceof Element){
            return Element.prototype.matches.call(element, selector);
        }

        win = Dom.getElementWindow(element);

        return (element instanceof win.Element) && Element.prototype.matches.call(element, selector);
    };

    /**
     * Get the closest ancestor of an element which matches a given CSS selector
     * 
     * @method closest
     * @static
     * @param {HTMLElement} element The element
     * @param {String} selector The CSS selector
     * @return {Element} The matched element
     */
    Dom.closest = function(element, selector){
        var document, win;

        if(element instanceof Element){
            return Element.prototype.closest.call(element, selector);
        }

        if(document = element.ownerDocument){
            if(win = document.defaultView || document.parentWindow){
                if(element instanceof win.Element){
                    return Element.prototype.closest.call(element, selector);
                }
            }
        }

        return null;
    };

    /**
     * Get the top and left offset of an element
     * 
     * @method offset
     * @static
     * @param {HTMLElement} element The element
     * @return {Object} The top and left offset
     */
    Dom.offset = function(element){
        var left = 0,
            top = 0;
            
        if(element.offsetParent){
            do{
                left += element.offsetLeft;
                top += element.offsetTop;
            }while (element = element.offsetParent);
        }

        return {'left': left, 'top': top};
    };

    /**
     * Add an element to the set of elements managed by the Dom object
     * 
     * @method add
     * @private
     * @param {Mixed} elements An array of elements or a single element to add
     */
    Dom.prototype.add = function(elements){
        if('length' in elements){
            for(var i = 0; i < elements.length; i++ ) {
                this.elements.push(elements[i]);
            }
        }
        else{
            this.elements.push(elements);
        }
    };

    /**
     * Get the number of elements managed by the Dom object
     * 
     * @method count
     * @return {Integer} The number of elements
     */
    Dom.prototype.count = function(){
        return this.elements.length;
    };

    /**
     * Get an element by index from the set of elements managed by the Dom object
     * 
     * @method get
     * @param {Integer} index The index of the elements to retreive
     * @return {Element} The element
     */
    Dom.prototype.get = function(index){
        return this.elements[index];
    };

    /**
     * Return a new Dom object with the elements filtered by a CSS selector
     * 
     * @method filter
     * @param {String} selector The CSS selector
     * @return {Dom} The new Dom object
     */
    Dom.prototype.filter = function(selector){
        var filtered = new Dom();

        this.each(function(index, element) {
            if(Dom.is(element, selector)){
                filtered.add(element);
            }
        }, this);

        return filtered;
    };

    /**
     * Get the index of the first element that matched the given CSS selector
     * 
     * @method index
     * @param {String} selector The CSS selector
     * @return {Integer} The index of the first matched element, or -1 if none
     */
    Dom.prototype.index = function(selector){
        var found = -1;

        this.each(function(index, element) {
            if(Dom.is(element, selector)){
                found = index;
                return false;
            }
        }, this);

        return found;
    };

    /**
     * Find all descendents that match a given CSS selector
     * 
     * @method find
     * @param {String} selector The CSS selector
     * @return {Dom} A Dom object of all matched descendents
     */
    Dom.prototype.find = function(selector){
        var descendents = new Dom();

        this.each(function(index, element) {
            descendents.add(Dom.selectElements.call(this, selector, element));
        }, this);

        return descendents;
    };

    /**
     * Get all children, optionally filtered by a given CSS selector
     * 
     * @method children
     * @param {String} [selector] The CSS selector
     * @return {Dom} A Dom object of all matched children
     */
    Dom.prototype.children = function(selector){
        var children = new Dom();

        this.each(function(index, element) {
            children.add(element.children);
        }, this);

        if(selector){
            children = children.filter(selector);
        }

        return children;
    };

    /**
     * Get the first child , optionally filtered by a given CSS selector
     * 
     * @method child
     * @param {String} [selector] The CSS selector
     * @return {Dom} A Dom object of the matched child
     */
    Dom.prototype.child = function(selector){
        return new Dom(this.children(selector).get(0));
    };

    /**
     * Get all parents, optionally filtered by a given CSS selector
     * 
     * @method parents
     * @param {String} [selector] The CSS selector
     * @return {Dom} A Dom object of all matched parents
     */
    Dom.prototype.parents = function(selector){
        var parents = new Dom();

        this.each(function(index, element) {
            parents.add(element.parentElement);
        }, this);

        if(selector){
            parents = parents.filter(selector);
        }

        return parents;
    };

    /**
     * Interate over all the elements managed by the Dom object
     * 
     * @method each
     * @param {Function} callback The function that will be executed on every element. The iteration is stopped if the callback return false
     * @param {Integer} callback.index The index of the current element being processed
     * @param {Element} callback.element The element that is currently being processed
     * @param {Mixed} scope The value to use as this when executing the callback function
     */
    Dom.prototype.each = function(callback, scope){
        scope = scope || this;

        metaScore.Array.each(this.elements, callback, scope);
    };

    /**
     * Check if an element in the set of elements managed by the Dom object has a given CSS class
     * 
     * @method hasClass
     * @param {String} className The CSS class
     * @return {Boolean} Whether a match was found
     */
    Dom.prototype.hasClass = function(className) {
        var found;

        this.each(function(index, element) {
            found = Dom.hasClass(element, className);
            return !found;
        }, this);

        return found;
    };

    /**
     * Add a CSS class to all the elements managed by the Dom object
     * 
     * @method addClass
     * @param {String} className The CSS class
     * @chainable
     */
    Dom.prototype.addClass = function(className) {
        this.each(function(index, element) {
            Dom.addClass(element, className);
        }, this);

        return this;
    };

    /**
     * Remove a CSS class from all the elements managed by the Dom object
     * 
     * @method removeClass
     * @param {String} className The CSS class
     * @chainable
     */
    Dom.prototype.removeClass = function(className) {
        this.each(function(index, element) {
            Dom.removeClass(element, className);
        }, this);

        return this;
    };

    /**
     * Toggle a CSS class for all the elements managed by the Dom object
     * 
     * @method toggleClass
     * @param {String} className The CSS class
     * @param {Boolean} [force] Whether to add or remove the class. The class is toggled if not specified
     * @chainable
     */
    Dom.prototype.toggleClass = function(className, force) {
        this.each(function(index, element) {
            Dom.toggleClass(element, className, force);
        }, this);

        return this;
    };

    /**
     * Add an event listener on all the elements managed by the Dom object
     * 
     * @method addListener
     * @static
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @chainable
     */
    Dom.prototype.addListener = function(type, callback, useCapture) {
     this.each(function(index, element) {
            Dom.addListener(element, type, callback, useCapture);
        }, this);

        return this;
    };

    /**
     * Add an event listener for descendents all the elements managed by the Dom object that match a given selector
     * 
     * @method addDelegate
     * @param {String} selector The CSS selector to filter descendents by
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The original event
     * @param {Element} callback.match The first matched descendent
     * @param {Mixed} [scope] The value to use as this when executing the callback function
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @chainable
     */
    Dom.prototype.addDelegate = function(selector, type, callback, scope, useCapture) {
        scope = scope || this;

        this.addListener(type, function(evt){
            var element = evt.target,
                match;

            while (element) {
                if(Dom.is(element, selector)){
                    match = element;
                    break;
                }

                element = element.parentElement;
            }

            if(match){
                callback.call(scope, evt, match);
            }
        }, useCapture);

        return this;
    };

    /**
     * Remove an event listener from all the elements managed by the Dom object
     * 
     * @method removeListener
     * @static
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} useCapture Whether the event should be executed in the capturing or in the bubbling phase
     * @chainable
     */
    Dom.prototype.removeListener = function(type, callback, useCapture) {
        this.each(function(index, element) {
            Dom.removeListener(element, type, callback, useCapture);
        }, this);

        return this;
    };

    /**
     * Trigger an event from all the elements managed by the Dom object
     * 
     * @method triggerEvent
     * @param {String} type The event type
     * @param {Object} [data] Custom data to send with the event. The data is accessible through the event.detail property
     * @param {Boolean} [bubbles=true] Whether the event bubbles up through the DOM or not
     * @param {Boolean} [cancelable=true] Whether the event is cancelable
     * @return {Boolean} Whether no event was cancelled
     */
    Dom.prototype.triggerEvent = function(type, data, bubbles, cancelable){
        var return_value = true;

        this.each(function(index, element) {
            return_value = Dom.triggerEvent(element, type, data, bubbles, cancelable) && return_value;
        }, this);

        return return_value;
    };

    /**
     * Set the innerHTML of all the elements managed by the Dom object, or get the innerHTML of the first element
     * 
     * @method text
     * @param {String} [html] The value to set
     * @return {Mixed} The Dom object if used as a setter, the innerHTML of the first element if used as a getter
     */
    Dom.prototype.text = function(value) {
        if(value !== undefined){
            this.each(function(index, element) {
                Dom.text(element, value);
            }, this);
        }
        else{
            return Dom.text(this.get(0));
        }
    };

    /**
     * Set the value of all the elements managed by the Dom object, or get the value of the first element
     * 
     * @method val
     * @param {String} [value] The value to set
     * @return {Mixed} The Dom object if used as a setter, the value of the first element if used as a getter
     */
    Dom.prototype.val = function(value) {
        if(value !== undefined){
            this.each(function(index, element) {
                Dom.val(element, value);
            }, this);
            return this;
        }
        else{
            return Dom.val(this.get(0));
        }
    };

    /**
     * Set an attribute of all the elements managed by the Dom object, or get the value of an attribute of the first element
     * 
     * @method attr
     * @param {HTMLElement} element The element
     * @param {String} [value] The value to set
     * @return {Mixed} The Dom object if used as a setter, the value of the first element if used as a getter
     */
    Dom.prototype.attr = function(name, value) {
        if(value !== undefined || metaScore.Var.is(name, 'object')){
            this.each(function(index, element) {
                Dom.attr(element, name, value);
            }, this);
            return this;
        }
        else{
            return Dom.attr(this.get(0), name);
        }
    };

    /**
     * Set a property of all the elements managed by the Dom object, or get the value of a property of the first element
     * 
     * @method prop
     * @param {HTMLElement} element The element
     * @param {String} [value] The value to set
     * @return {Mixed} The Dom object if used as a setter, the value of the first element if used as a getter
     */
    Dom.prototype.prop = function(name, value) {
        if(value !== undefined || metaScore.Var.is(name, 'object')){
            this.each(function(index, element) {
                Dom.prop(element, name, value);
            }, this);
            return this;
        }
        else{
            return Dom.prop(this.get(0), name);
        }
    };

    /**
     * Set CSS style property of all the elements managed by the Dom object, or get the value of a CSS style property of the first element
     * 
     * @method css
     * @param {String} name The CSS property's name
     * @param {String} value The CSS property's value
     * @param {Boolean} [inline=false] Whether to return the inline or computed style value
     * @return {Mixed} The Dom object if used as a setter, the CSS style value of the property of the first element if used as a getter
     */
    Dom.prototype.css = function(name, value, inline) {
        if(value !== undefined){
            this.each(function(index, element) {
                Dom.css(element, name, value, inline);
            }, this);
            return this;
        }
        else{
            return Dom.css(this.get(0), name, value, inline);
        }
    };

    /**
     * Set a custom data attribute on all the elements managed by the Dom object, or get the value of a custom data attribute of the first element
     * 
     * @method data
     * @param {String} name The name of the data attribute
     * @param {String} value The value of the data attribute
     * @return {Mixed} The Dom object if used as a setter, the value of the data attribute of the first element if used as a getter
     */
    Dom.prototype.data = function(name, value) {
        if(value !== undefined){
            this.each(function(index, element) {
                Dom.data(element, name, value);
            }, this);
            return this;
        }
        else{
            return Dom.data(this.get(0), name);
        }
    };

    /**
     * Append children to the first element managed by the Dom object
     * 
     * @method append
     * @param {Mixed} children An array of elemets or a single element to append
     * @chainable
     */
    Dom.prototype.append = function(children){
        if(children instanceof Dom){
            children = children.elements;
        }

        Dom.append(this.get(0), children);

        return this;
    };

    /**
     * Append each of the elements managed by the Dom object into a given element
     * 
     * @method appendTo
     * @param {Mixed} parent A Dom object or an Element to append the elements to
     * @chainable
     */
    Dom.prototype.appendTo = function(parent){
        if(!(parent instanceof Dom)){
            parent = new Dom(parent);
        }

        parent = parent.get(0);

        this.each(function(index, element) {
            Dom.append(parent, element);
        }, this);

        return this;
    };

    /**
     * Append each of the elements managed by the Dom object into a given element at a given position
     * 
     * @method insertAt
     * @param {Mixed} parent A Dom object or an Element to append the elements to
     * @param {Integer} index The index position to append at
     * @chainable
     */
    Dom.prototype.insertAt = function(parent, index){
        var element;

        if(!(parent instanceof Dom)){
            parent = new Dom(parent);
        }

        element = parent.children().get(index);

        if(element){
            Dom.before(element, this.elements);
        }
        else{
            this.appendTo(parent);
        }

        return this;
    };

    /**
     * Remove all children of each element managed by the Dom object 
     * 
     * @method empty
     * @chainable
     */
    Dom.prototype.empty = function(){
        this.each(function(index, element) {
            Dom.empty(element);
        }, this);

        return this;
    };

    /**
     * Make all the elements managed by the Dom object visible
     * 
     * @method show
     * @chainable
     */
    Dom.prototype.show = function(){
        this.css('display', '');

        return this;
    };

    /**
     * Make all the elements managed by the Dom object invisible
     * 
     * @method hide
     * @chainable
     */
    Dom.prototype.hide = function(){
        this.css('display', 'none');

        return this;
    };

    /**
     * Set focus on the first element managed by the Dom object
     * 
     * @method focus
     * @chainable
     */
    Dom.prototype.focus = function(){
        this.get(0).focus();

        return this;
    };

    /**
     * Remove focus from the first element managed by the Dom object
     * 
     * @method blur
     * @chainable
     */
    Dom.prototype.blur = function(){
        this.get(0).blur();

        return this;
    };

    /**
     * Get the top and left offset of the first element managed by the Dom object
     * 
     * @method offset
     * @return {Object} offset The top and left offset
     */
    Dom.prototype.offset = function(){
        return Dom.offset(this.get(0));
    };

    /**
     * Remove all the elements managed by the Dom object from the DOM
     * 
     * @method remove
     * @chainable
     */
    Dom.prototype.remove = function(){
        if(this.triggerEvent(EVT_BEFOREREMOVE) !== false){
            this.each(function(index, element) {
                var parent = element.parentElement;
                Dom.remove(element);
                Dom.triggerEvent(parent, EVT_CHILDREMOVE, {'child': element});
            }, this);
        }

        return this;
    };

    /**
     * Check if an element from the elements managed by the Dom object matches a CSS selector
     * 
     * @method is
     * @param {String} selector The CSS selector
     * @return {Boolean} Whether an element matches the CSS selector
     */
    Dom.prototype.is = function(selector){
        var found;

        this.each(function(index, element) {
            found = Dom.is(element, selector);
            return found;
        }, this);

        return found;
    };

    /**
     * Get the first closest ancestor of the elements managed by the Dom object which matches a given CSS selector
     * 
     * @method closest
     * @param {String} selector The CSS selector
     * @return {Element} The matched element
     */
    Dom.prototype.closest = function(selector){
        var found;

        this.each(function(index, element) {
            found = Dom.closest(element, selector);
            return found !== null;
        }, this);

        return found;
    };

    return Dom;

})();
/** 
 * @module Core
 */

metaScore.Ajax = (function () {

    /**
     * A class to handle AJAX requests
     *
     * @class Ajax
     * @constructor
     */
    function Ajax() {
    }

    /**
     * Send an XMLHttp request
     *
     * @method send
     * @static
     * @param {String} url The URL to which the request is sent
     * @param {Object} options to set for the request
     * @param {String} [options.method='GET'] The method used for the request (GET, POST, or PUT)
     * @param {Object} [options.headers={}] An object of additional header key/value pairs to send along with requests
     * @param {Boolean} [options.async=true] Whether the request is asynchronous or not
     * @param {Object} [options.data={}] Data to be send along with the request
     * @param {String} [options.dataType='json'] The type of data expected back from the server
     * @param {Funtion} [options.complete] A function to be called when the request finishes
     * @param {Funtion} [options.success] A function to be called if the request succeeds
     * @param {Funtion} [options.error] A function to be called if the request fails
     * @param {Object} [options.scope=this] The object to which the scope of the above functions should be set
     * @return {XMLHttpRequest} The XHR request
     */
    Ajax.send = function(url, options) {

        var key,
            xhr = new XMLHttpRequest(),
            defaults = {
                'method': 'GET',
                'headers': {},
                'async': true,
                'data': {},
                'dataType': 'json', // xml, json, script, text or html
                'complete': null,
                'success': null,
                'error': null,
                'scope': this
            };

        options = metaScore.Object.extend({}, defaults, options);

        xhr.open(options.method, url, options.async);

        metaScore.Object.each(options.headers, function(key, value){
            xhr.setRequestHeader(key, value);
        });

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if(metaScore.Var.is(options.complete, 'function')){
                    options.complete.call(options.scope, xhr);
                }
                if((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304){
                    if(metaScore.Var.is(options.success, 'function')){
                        options.success.call(options.scope, xhr);
                    }
                }
                else if(metaScore.Var.is(options.error, 'function')){
                    options.error.call(options.scope, xhr);
                }
            }
        };

        xhr.send(options.data);

        return xhr;

    };

    /**
     * Send an XMLHttp GET request
     * 
     * @method get
     * @static
     * @param {String} url The URL to which the request is sent
     * @param {Object} options to set for the request. See {{#crossLink "Ajax/send:method"}}send{{/crossLink}} for available options
     * @return {XMLHttpRequest} The XHR request
     */
    Ajax.get = function(url, options) {

        metaScore.Object.extend(options, {'method': 'GET'});

        return Ajax.send(url, options);

    };

    /**
     * Send an XMLHttp POST request
     * 
     * @method post
     * @static
     * @param {String} url The URL to which the request is sent
     * @param {Object} options to set for the request. See {{#crossLink "Ajax/send:method"}}send{{/crossLink}} for available options
     * @return {XMLHttpRequest} The XHR request
     */
    Ajax.post = function(url, options) {

        metaScore.Object.extend(options, {'method': 'POST'});

        return Ajax.send(url, options);

    };

    /**
     * Send an XMLHttp PUT request
     * 
     * @method put
     * @static
     * @param {String} url The URL to which the request is sent
     * @param {Object} options to set for the request. See {{#crossLink "Ajax/send:method"}}send{{/crossLink}} for available options
     * @return {XMLHttpRequest} The XHR request
     */
    Ajax.put = function(url, options) {

        metaScore.Object.extend(options, {'method': 'PUT'});

        return Ajax.send(url, options);

    };

    return Ajax;

})();
/**
 * @module Core
 */

metaScore.Array = (function () {

    /**
     * A class for array helper functions
     * 
     * @class Array
     * @constructor
     */
    function Array() {
    }

    /**
     * Check if a value is in an array
     * 
     * @method inArray
     * @static
     * @param {Mixed} needle The value to search
     * @param {Array} haystack The array
     * @return {Integer} The index of the first match, -1 if none
     */
    Array.inArray = function(needle, haystack){
        var len, i = 0;

        if(haystack) {
            if(haystack.indexOf){
                return haystack.indexOf(needle);
            }

            len = haystack.length;

            for(; i < len; i++){
                // Skip accessing in sparse arrays
                if(i in haystack && haystack[i] === needle){
                    return i;
                }
            }
        }

        return -1;
    };

    /**
     * Copy an array
     * 
     * @method copy
     * @static
     * @param {Array} arr The original array
     * @return {Array} The copy
     */
    Array.copy = function(arr) {
        return [].concat(arr);
    };

    /**
     * Shuffle array elements
     * 
     * @method shuffle
     * @static
     * @param {Array} arr The array to shuffle
     * @return {Array} The shuffled copy of the array
     */
    Array.shuffle = function(arr) {
        var shuffled = Array.copy(arr);

        shuffled.sort(function(){
            return ((Math.random() * 3) | 0) - 1;
        });

        return shuffled;
    };

    /**
     * Remove duplicate values from an array
     * 
     * @method unique
     * @static
     * @param {Array} arr The array to remove duplicates from
     * @return {Array} A copy of the array with no duplicates
     */
    Array.unique = function(arr) {
        var unique = [],
            length = arr.length;

        for(var i=0; i<length; i++){
            for(var j=i+1; j<length; j++){
                // If this[i] is found later in the array
                if(arr[i] === arr[j]){
                    j = ++i;
                }
            }
            unique.push(arr[i]);
        }

        return unique;
    };

    /**
     * Iterate over an array with a callback function
     * 
     * @method each
     * @static
     * @param {Array} arr The array to iterate over
     * @param {Function} callback The function that will be executed on every element. The iteration is stopped if the callback return false
     * @param {Integer} callback.index The index of the current element being processed in the array
     * @param {Mixed} callback.value The element that is currently being processed in the array
     * @param {Mixed} scope The value to use as this when executing the callback
     * @return {Array} The array
     */
    Array.each = function(arr, callback, scope) {
        var i = 0,
            l = arr.length,
            value,
            scope_provided = scope !== undefined;

        for(; i < l; i++) {
            value = callback.call(scope_provided ? scope : arr[i], i, arr[i]);

            if (value === false) {
                break;
            }
        }

        return arr;
    };

    /**
     * Remove a elements from an array by value
     * 
     * @method remove
     * @static
     * @param {Array} arr The array to remove the elements from
     * @param {Mixed} value The value to search for
     * @return {Array} The array
     */
    Array.remove = function(arr, value){
        var index = Array.inArray(value, arr);

        while(index > -1){
            arr.splice(index, 1);
            index = Array.inArray(value, arr);
        }

        return arr;
    };

    /**
     * A natural sort function generator
     * 
     * @method naturalSort
     * @author Jim Palmer (http://www.overset.com/2008/09/01/javascript-natural-sort-algorithm-with-unicode-support/) - version 0.7
     * @static
     * @param {Boolean} [insensitive=false] Whether the sort should not be case-sensitive
     * @return {Function} The sorting function
     * 
     * @example
     *     var arr = ["c", "A2", "a1", "d", "b"];
     *     arr.sort(metaScore.Array.naturalSort(true));
     *     // ["a1", "A2", "b", "c", "d"]
     * 
     * @example
     *     var arr = ["c", "A2", "a1", "d", "b"];
     *     arr.sort(metaScore.Array.naturalSort(false));
     *     // ["A2", "a1", "b", "c", "d"]
     */
    Array.naturalSort = function(insensitive){
        return function(a, b){
            var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
                sre = /(^[ ]*|[ ]*$)/g,
                dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
                hre = /^0x[0-9a-f]+$/i,
                ore = /^0/,
                i = function(s) { return insensitive && (''+s).toLowerCase() || ''+s },
                // convert all to strings strip whitespace
                x = i(a).replace(sre, '') || '',
                y = i(b).replace(sre, '') || '',
                // chunk/tokenize
                xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
                yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
                // numeric, hex or date detection
                xD = parseInt(x.match(hre)) || (xN.length !== 1 && x.match(dre) && Date.parse(x)),
                yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
                oFxNcL, oFyNcL;
            // first try and sort Hex codes or Dates
            if (yD) {
                if ( xD < yD ) { return -1; }
                else if ( xD > yD ) { return 1; }
            }
            // natural sorting through split numeric strings and default strings
            for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
                    // find floats not starting with '0', string or 0 if not defined (Clint Priest)
                    oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
                    oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
                    // handle numeric vs string comparison - number < string - (Kyle Adams)
                    if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
                    // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
                    else if (typeof oFxNcL !== typeof oFyNcL) {
                            oFxNcL += '';
                            oFyNcL += '';
                    }
                    if (oFxNcL < oFyNcL) { return -1; }
                    if (oFxNcL > oFyNcL) { return 1; }
            }
            return 0;
        };
    };

    /**
     * A natural case-insentive sorting function to use with Array.sort
     * 
     * @method naturalSortInsensitive
     * @static
     * @param {String} a The first string to compare
     * @param {String} b The second string to compare
     * @return {Integer} See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
     */
    Array.naturalSortInsensitive = Array.naturalSort(true);
    

    /**
     * A natural case-sentive sorting function to use with Array.sort
     * 
     * @method naturalSortInsensitive
     * @static
     * @param {String} a The first string to compare
     * @param {String} b The second string to compare
     * @return {Integer} See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
     */
    Array.naturalSortSensitive = Array.naturalSort(false);

    return Array;

})();
/**
 * @module Core
 */

metaScore.Button = (function () {

    /**
     * A simple button based on an HTML button element
     *
     * @class Button
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.label=null] A text to add as a label
     */
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
        'label': null
    };

    metaScore.Dom.extend(Button);

    /**
     * The click event handler
     *
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    Button.prototype.onClick = function(evt){
        if(this.disabled){
            evt.stopPropagation();
        }
    };

    /**
     * Set the button's text
     *
     * @method setLabel
     * @param {String} text The text to use as the label
     * @chainable
     */
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
     *
     * @method disable
     * @chainable
     */
    Button.prototype.disable = function(){
        this.disabled = true;

        this.addClass('disabled');

        return this;
    };

    /**
     * Enable the button
     *
     * @method enable
     * @chainable
     */
    Button.prototype.enable = function(){
        this.disabled = false;

        this.removeClass('disabled');

        return this;
    };

    return Button;

})();
/**
 * @module Core
 */

metaScore.Clipboard = (function(){

    /**
     * A class to handle clipboard data
     *
     * @class Clipboard
     * @extends Evented
     * @constructor
     */
    function Clipboard() {
        // call parent constructor
        Clipboard.parent.call(this);

        this.data = null;
    }

    metaScore.Evented.extend(Clipboard);

    /**
    * Set the stored data
    *
    * @method setData
    * @param {String} type The data type
    * @param {Mixed} data The data
    * @chainable
    */
    Clipboard.prototype.setData = function(type, data){
        this.data = {
          'type': type,
          'data': data
        };

        return this;
    };

    /**
    * Get the stored data
    *
    * @method getData
    * @return {Mixed} The data
    */
    Clipboard.prototype.getData = function(){
        return this.data ? this.data.data : null;
    };

    /**
    * Get the stored data type
    *
    * @method getData
    * @return {String} The data type
    */
    Clipboard.prototype.getDataType = function(){
        return this.data ? this.data.type : null;
    };

    /**
    * Clear the stored data
    *
    * @method clearData
    * @chainable
    */
    Clipboard.prototype.clearData = function(){  
        this.data = null;

        return this;
    };

    return Clipboard;

})();
/**
 * @module Core
 */

metaScore.Color = (function () {

    /**
     * A class for color helper functions
     * 
     * @class Color
     * @constructor
     */
    function Color() {
    }

    /**
     * Convert an RGB value to HSV
     * 
     * @method rgb2hsv
     * @static
     * @param {Object} rgb The rgb value as an object with 'r', 'g', and 'b' keys
     * @return {Object} The hsv value as an object with 'h', 's', and 'v' keys
     */
    Color.rgb2hsv = function (rgb){
        var r = rgb.r, g = rgb.g, b = rgb.b,
            max = Math.max(r, g, b),
            min = Math.min(r, g, b),
            d = max - min,
            h, s, v;

        s = max === 0 ? 0 : d / max;
        v = max;

        if(max === min) {
            h = 0; // achromatic
        }
        else {
            switch(max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;

                case g:
                    h = (b - r) / d + 2;
                    break;

                case b:
                    h = (r - g) / d + 4;
                    break;
            }

            h /= 6;
        }

        return {
            'h': h,
            's': s,
            'v': v
        };
    };

    /**
     * Parse a CSS color value into an object with 'r', 'g', 'b', and 'a' keys
     * 
     * @method parse
     * @static
     * @param {Mixed} color The CSS value to parse
     * @return {Object} The color object with 'r', 'g', 'b', and 'a' keys
     */
    Color.parse = function(color){
        var rgba, matches;

        rgba = {
            r: 0,
            g: 0,
            b: 0,
            a: 0,
        };

        if(metaScore.Var.is(color, 'object')){
            rgba.r = 'r' in color ? color.r : 0;
            rgba.g = 'g' in color ? color.g : 0;
            rgba.b = 'b' in color ? color.b : 0;
            rgba.a = 'a' in color ? color.a : 1;
        }
        else if(metaScore.Var.is(color, 'string')){
            color = color.replace(/\s\s*/g,''); // Remove all spaces

            // Checks for 6 digit hex and converts string to integer
            if (matches = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color)){
                rgba.r = parseInt(matches[1], 16);
                rgba.g = parseInt(matches[2], 16);
                rgba.b = parseInt(matches[3], 16);
                rgba.a = 1;
            }

            // Checks for 3 digit hex and converts string to integer
            else if (matches = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(color)){
                rgba.r = parseInt(matches[1], 16) * 17;
                rgba.g = parseInt(matches[2], 16) * 17;
                rgba.b = parseInt(matches[3], 16) * 17;
                rgba.a = 1;
            }

            // Checks for rgba and converts string to
            // integer/float using unary + operator to save bytes
            else if (matches = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(color)){
                rgba.r = +matches[1];
                rgba.g = +matches[2];
                rgba.b = +matches[3];
                rgba.a = +matches[4];
            }

            // Checks for rgb and converts string to
            // integer/float using unary + operator to save bytes
            else if (matches = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color)){
                rgba.r = +matches[1];
                rgba.g = +matches[2];
                rgba.b = +matches[3];
                rgba.a = 1;
            }
        }

        return rgba;
    };

    return Color;

})();
/**
 * @module Core
 */

metaScore.ContextMenu = (function(){

    /**
     * Fired when a task is clicked
     *
     * @event taskclick
     * @param {Object} action The task's action
     * @param {Object} context The task's context
     */
    var EVT_TASKCLICK = 'taskclick';

    /**
     * A class for creating context menus
     *
     * @class ContextMenu
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Mixed} [configs.target='body'] The HTMLElement, Dom instance, or CSS selector to which the context menu is attached
     * @param {Mixed} [configs.items={}] The list of items and subitems
     */
    function ContextMenu(configs) {
        var list;
        
        this.configs = this.getConfigs(configs);

        // call parent constructor
        ContextMenu.parent.call(this, '<div/>', {'class': 'contextmenu'});
        
        this.tasks = {};
        this.context = null;

        // fix event handlers scope
        this.onTargetContextmenu = metaScore.Function.proxy(this.onTargetContextmenu, this);
        this.onTargetMousedown = metaScore.Function.proxy(this.onTargetMousedown, this);
        this.onTaskClick = metaScore.Function.proxy(this.onTaskClick, this);
        
        list = new metaScore.Dom('<ul/>')
            .appendTo(this);
        
        metaScore.Object.each(this.configs.items, function(key, task){
            this.addTask(key, task, list);
        }, this);
        
        if(this.configs.target){
            this.setTarget(this.configs.target);
        }
        
        this
            .addListener('contextmenu', metaScore.Function.proxy(this.onContextmenu, this))
            .addListener('mousedown', metaScore.Function.proxy(this.onMousedown, this))
            .addDelegate('li', 'mouseover', metaScore.Function.proxy(this.onItemMouseover, this))
            .hide()
            .enable();
    }

    metaScore.Dom.extend(ContextMenu);

    ContextMenu.defaults = {
        'target': 'body',
        'items': {}
    };

    /**
     * Mousedown event handler
     *
     * @method onMousedown
     * @private
     * @param {Event} evt The event object
     */
    ContextMenu.prototype.onContextmenu = function(evt){        
        if(!evt.shiftKey){
            evt.preventDefault();
        }
        
        evt.stopPropagation();
        
    };

    /**
     * Mousedown event handler
     *
     * @method onMousedown
     * @private
     * @param {Event} evt The event object
     */
    ContextMenu.prototype.onMousedown = function(evt){
        evt.stopPropagation();
    };

    /**
     * Task mouseover event handler
     *
     * @method onItemMouseover
     * @private
     * @param {Event} evt The event object
     */
    ContextMenu.prototype.onItemMouseover = function(evt){
        var item = new metaScore.Dom(evt.target),
            container, conteiner_width, conteiner_offset,
            subitems, subitems_width, subitems_offset;
            
        if(!item.hasClass('has-subitems')){
            return;
        }
        
        container = this.parents();
        conteiner_width = container.get(0).offsetWidth;
        conteiner_offset = container.offset();
        subitems = item.child('ul').removeClass('left');
        subitems_width = subitems.get(0).offsetWidth;
        subitems_offset = subitems.offset();
            
        subitems.toggleClass('left', subitems_offset.left - conteiner_offset.left + subitems_width > conteiner_width);
    };

    /**
     * Target's contextmenu event handler
     *
     * @method onTargetContextmenu
     * @private
     * @param {Event} evt The event object
     */
    ContextMenu.prototype.onTargetContextmenu = function(evt){
        var x, y;
        
        if(evt.shiftKey){
            return;
        }
        
        if(evt.pageX || evt.pageY){
            x = evt.pageX;
            y = evt.pageY;
        }
        else if(evt.clientX || evt.clientY){
            x = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        else{
            x = 0;
            y = 0;
        }
        
        this.show(evt.target, x, y);
        
        evt.preventDefault();
    };

    /**
     * Target's mousedown event handler
     *
     * @method onTargetMousedown
     * @private
     * @param {Event} evt The event object
     */
    ContextMenu.prototype.onTargetMousedown = function(evt){    
        this.hide();
    };

    /**
     * Task's click event handler
     *
     * @method onTaskClick
     * @private
     * @param {Event} evt The event object
     */
    ContextMenu.prototype.onTaskClick = function(evt){
        var action = new metaScore.Dom(evt.target).data('action');
            
        if(action in this.tasks){
            if(this.tasks[action].callback){
                this.tasks[action].callback(this.context);
                this.hide();
            }
            
            this.triggerEvent(EVT_TASKCLICK, {'action': action, 'context': this.context}, true, false);
        }
        
        evt.stopPropagation();
    };

    /**
     * Sets the target element
     *
     * @method setTarget
     * @param {Mixed} target The HTMLElement, Dom instance, or CSS selector to which the context menu is attached
     * @chainable
     */
    ContextMenu.prototype.setTarget = function(target){        
        this.disable();
        
        this.target = target;
        
        if(!(this.target instanceof metaScore.Dom)){
            this.target = new metaScore.Dom(this.target);
        }
        
        return this;
    };

    /**
     * Add a task
     *
     * @method addTask
     * @param {String} action The task's associated action
     * @param {Object} configs The task's configs
     * @param {String} [configs.text] The task's text
     * @param {Mixed} [configs.toggler=true] A boolean or a callback function used to determine if the task is active
     * @param {Mixed} [parent] The parent element to append the task to
     * @chainable
     */
    ContextMenu.prototype.addTask = function(action, configs, parent){
        var task, subtasks;
            
        task = new metaScore.Dom('<li/>', {'data-action': action})
            .addListener('click', this.onTaskClick)
            .appendTo(parent);
            
        if('text' in configs){
            task.text(configs.text);
        }
            
        if(!('callback' in configs)){
            task.addClass('no-callback');
        }
            
        if('class' in configs){
            task.addClass(configs.class);
        }
        
        if('items' in configs){
            task.addClass('has-subitems');
            
            subtasks = new metaScore.Dom('<ul/>')
                .appendTo(task);
            
            metaScore.Object.each(configs.items, function(subkey, subtask){
                this.addTask(subkey, subtask, subtasks);
            }, this);
        }
        
        this.tasks[action] = {
            'toggler': 'toggler' in configs ? configs.toggler : true,
            'callback': 'callback' in configs ? configs.callback : null,
            'el': task
        };
            
        return this;
    };

    /**
     * Add a separator
     *
     * @method addSeparator
     * @chainable
     */
    ContextMenu.prototype.addSeparator = function(){
        new metaScore.Dom('<li/>', {'class': 'separator'})
            .appendTo(this);
            
        return this;
    };

    /**
     * Show the menu
     *
     * @method show
     * @param {HTMLElement} el The element on which the contextmenu event was triggered
     * @param {Number} x The horizontal position at which the menu should be shown
     * @param {Number} y The vertical position at which the menu should be shown
     * @chainable
     */
    ContextMenu.prototype.show = function(el, x, y){
        var window, window_width, window_height,
            menu_el, menu_width, menu_height;
        
        this.context = el;
    
        metaScore.Object.each(this.tasks, function(key, task){
            var active = metaScore.Var.is(task.toggler, 'function') ? task.toggler(this.context) === true : task.toggler !== false;
            
            if(active){
                task.el.removeClass('disabled');
            }
            else{
                task.el.addClass('disabled');
            }
        }, this);
    
        this.target.addListener('mousedown', this.onTargetMousedown);

        // call parent function
        ContextMenu.parent.prototype.show.call(this);
        
        menu_el = this.get(0);
        window = metaScore.Dom.getElementWindow(this.context);
        window_width = window.innerWidth;
        window_height = window.innerHeight;
        menu_width = menu_el.offsetWidth;
        menu_height = menu_el.offsetHeight;
        
        if((menu_width + x) > window_width){
            x = window_width - menu_width;
        }

        if((menu_height + y) > window_height){
            y = window_height - menu_height;
        }
        
        this
            .css('left', x +'px')
            .css('top', y +'px');
        
        return this;
    };

    /**
     * Hide the menu
     *
     * @method hide
     * @chainable
     */
    ContextMenu.prototype.hide = function(){
        if(this.target){
            this.target.removeListener('mousedown', this.onTargetMousedown);
        }
        
        this.context = null;

        // call parent function
        ContextMenu.parent.prototype.hide.call(this);
        
        return this;
    };

    /**
     * Enable the menu
     * 
     * @method enable
     * @chainable
     */
    ContextMenu.prototype.enable = function(){        
        if(this.target){
            this.enabled = true;
            
            this.target.addListener('contextmenu', this.onTargetContextmenu);
        }

        return this;
    };

    /**
     * Disable the menu
     * 
     * @method disable
     * @chainable
     */
    ContextMenu.prototype.disable = function(){
        if(this.target){
            this.target.removeListener('contextmenu', this.onTargetContextmenu);
        }
        
        this.hide();

        this.enabled = false;

        return this;
    };

    return ContextMenu;

})();
/**
 * @module Core
 */

metaScore.Draggable = (function () {

    /**
     * Fired when the dragging started
     *
     * @event dragstart
     */
    var EVT_DRAGSTART = 'dragstart';

    /**
     * Fired when a drag occured
     *
     * @event drag
     */
    var EVT_DRAG = 'drag';

    /**
     * Fired when the dragging ended
     *
     * @event dragend
     */
    var EVT_DRAGEND = 'dragend';

    /**
     * A class for adding draggable behaviors
     * 
     * @class Draggable
     * @extends Class
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Dom} configs.target The Dom object to add the behavior to
     * @param {Dom} configs.handle The Dom object to use as a dragging handle
     * @param {Object} [configs.limits={'top': null, 'left': null}] The limits of the dragging
     */
    function Draggable(configs) {
        this.configs = this.getConfigs(configs);

        this.doc = new metaScore.Dom(this.configs.target.get(0).ownerDocument);

        // fix event handlers scope
        this.onMouseDown = metaScore.Function.proxy(this.onMouseDown, this);
        this.onMouseMove = metaScore.Function.proxy(this.onMouseMove, this);
        this.onMouseUp = metaScore.Function.proxy(this.onMouseUp, this);

        this.configs.handle.addListener('mousedown', this.onMouseDown);

        this.enable();
    }

    Draggable.defaults = {
        'target': null,
        'handle': null,
        'limits': {
            'top': null,
            'left': null
        }
    };

    metaScore.Class.extend(Draggable);

    /**
     * The mousedown event handler
     * 
     * @method onMouseDown
     * @private
     * @param {Event} evt The event object
     */
    Draggable.prototype.onMouseDown = function(evt){
        if(!this.enabled){
            return;
        }

        this.start_state = {
            'left': parseInt(this.configs.target.css('left'), 10) - evt.clientX,
            'top': parseInt(this.configs.target.css('top'), 10) - evt.clientY
        };

        this.doc
            .addListener('mouseup', this.onMouseUp)
            .addListener('mousemove', this.onMouseMove);

        this.configs.target
            .addClass('dragging')
            .triggerEvent(EVT_DRAGSTART, null, false, true);

        evt.stopPropagation();
    };

    /**
     * The mousemove event handler
     * 
     * @method onMouseMove
     * @private
     * @param {Event} evt The event object
     */
    Draggable.prototype.onMouseMove = function(evt){
        var left = evt.clientX + this.start_state.left,
            top = evt.clientY + this.start_state.top;

        if(!isNaN(this.configs.limits.top)){
            top = Math.max(top, this.configs.limits.top);
        }

        if(!isNaN(this.configs.limits.left)){
            left = Math.max(left, this.configs.limits.left);
        }

        this.configs.target
            .css('left', left + 'px')
            .css('top', top + 'px')
            .triggerEvent(EVT_DRAG, null, false, true);

        evt.stopPropagation();
    };

    /**
     * The mouseup event handler
     * 
     * @method onMouseUp
     * @private
     * @param {Event} evt The event object
     */
    Draggable.prototype.onMouseUp = function(evt){
        this.doc
            .removeListener('mousemove', this.onMouseMove)
            .removeListener('mouseup', this.onMouseUp);

        this.configs.target
            .removeClass('dragging')
            .triggerEvent(EVT_DRAGEND, null, false, true);

        evt.stopPropagation();
    };

    /**
     * Enable the behavior
     * 
     * @method enable
     * @chainable
     */
    Draggable.prototype.enable = function(){
        this.configs.target.addClass('draggable');

        this.configs.handle.addClass('drag-handle');

        this.enabled = true;

        return this;
    };

    /**
     * Disable the behavior
     * 
     * @method disable
     * @chainable
     */
    Draggable.prototype.disable = function(){
        this.configs.target.removeClass('draggable');

        this.configs.handle.removeClass('drag-handle');

        this.enabled = false;

        return this;
    };

    /**
     * Destroy the behavior
     * 
     * @method destroy
     * @chainable
     */
    Draggable.prototype.destroy = function(){
        this.disable();

        this.configs.handle.removeListener('mousedown', this.onMouseDown);

        return this;
    };

    return Draggable;

})();
/**
 * @module Core
 */

metaScore.Function = (function () {

    /**
     * A class for function helper functions
     * 
     * @class Function
     * @constructor
     */
    function Function() {
    }

    /**
     * Create a proxy of a function
     * 
     * @method proxy
     * @static
     * @param {Function} fn The function to proxy
     * @param {Mixed} scope The value to use as this when executing the proxy function
     * @param {Array} args Extra arguments to preppend to the passed arguments when the proxy function is called
     * @return {Function} The proxy function
     */
    Function.proxy = function(fn, scope, args){
        if (!metaScore.Var.type(fn, 'function')){
            return undefined;
        }

        return function () {
            var args_array;

            if(args){
                args_array = Array.prototype.slice.call(args); // transform args to a true array
                args_array = args_array.concat(Array.prototype.slice.call(arguments)); // concat passed arguments to the args_array
            }
            else{
                args_array = arguments;
            }

            return fn.apply(scope || this, args_array);
        };
    };

    return Function;

})();
/**
 * @module Core
 */

metaScore.Locale = (function(){

    /**
     * The i18n handling class
     *
     * @class Locale
     * @constructor
     */
    function Locale() {
    }

    /**
     * Translate a string
     *
     * @method t
     * @static
     * @param {String} key The string identifier
     * @param {String} str The default string to use if no translation is found
     * @param {Object} args An object of replacements to make after translation
     * @return {String} The translated string
     */
    Locale.t = function(key, str, args){
        if(typeof(metaScoreLocale) !== "undefined" && metaScoreLocale.hasOwnProperty(key)){
            str = metaScoreLocale[key];
        }

        return Locale.formatString(str, args);
    };

    /**
     * Replace placeholders with sanitized values in a string
     *
     * @method formatString
     * @static
     * @param {String} str The string to process
     * @param {Object} args An object of replacements with placeholders as keys
     * @return {String} The translated string
     */
    Locale.formatString = function(str, args) {
        metaScore.Object.each(args, function(key, value){
            str = str.replace(key, args[key]);
        }, this);

        return str;
    };

    return Locale;

})();
/**
 * @module Core
 */

metaScore.Object = (function () {

    /**
     * A class for object helper functions
     * 
     * @class Object
     * @constructor
     */
    function Object() {
    }

    /**
     * Merge the contents of two or more objects together into the first object
     * 
     * @method extend
     * @static
     * @param {Object} [first] The object to which other objects are merged
     * @param {Object} [...others] The objects to merge with the first one
     * @return {Object} The first object
     */
    Object.extend = function() {
        var target = arguments[0] || {},
            options,
            i = 1,
            length = arguments.length,
            key, src, copy;

        for (; i < length; i++ ) {
            if ((options = arguments[i]) != null) {
                for ( key in options ) {
                    src = target[key];
                    copy = options[key];

                    if(src !== copy && copy !== undefined ) {
                        target[key] = copy;
                    }
                }
            }
        }

        return target;
    };

    /**
     * Return a copy of an object
     * 
     * @method copy
     * @static
     * @param {Object} obj The original object
     * @return {Object} The object copy
     */
    Object.copy = function(obj) {
        return Object.extend({}, obj);
    };

    /**
     * Iterate over an object
     * 
     * @method each
     * @static
     * @param {Object} obj The object to iterate over
     * @param {Function} callback The function that will be executed on every element. The iteration is stopped if the callback return false
     * @param {String} callback.key The key of the current element being processed in the object
     * @param {Mixed} callback.value The element that is currently being processed in the object
     * @param {Mixed} scope The value to use as this when executing the callback
     * @return {Object} The object
     */
    Object.each = function(obj, callback, scope) {
        var key, value,
            scope_provided = scope !== undefined;

        for (key in obj) {
            value = callback.call(scope_provided ? scope : obj[key], key, obj[key]);

            if (value === false) {
                break;
            }
        }

        return obj;
    };

    return Object;

})();
/**
 * @module Core
 */

metaScore.Overlay = (function(){

    /**
     * Fired when the overlay is shown
     *
     * @event show
     * @param {Object} overlay The overlay instance
     */
    var EVT_SHOW = 'show';

    /**
     * Fired when the overlay is hidden
     *
     * @event hide
     * @param {Object} overlay The overlay instance
     */
    var EVT_HIDE = 'hide';

    /**
     * A generic overlay class
     *
     * @class Overlay
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.parent='body'] The parent element in which the overlay will be appended
     * @param {Boolean} [configs.modal=true] Whether to create a mask underneath that covers its parent and does not allow the user to interact with any other Components until this is dismissed
     * @param {Boolean} [configs.draggable=true] Whether the overlay is draggable
     * @param {Boolean} [configs.autoShow=true] Whether to show the overlay automatically
     * @param {Boolean} [configs.toolbar=false] Whether to add a toolbar with title and close button
     * @param {String} [configs.title=''] The overlay's title
     */
    function Overlay(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Overlay.parent.call(this, '<div/>', {'class': 'overlay clearfix'});

        this.setupUI();

        if(this.configs.autoShow){
            this.show();
        }
    }

    Overlay.defaults = {
        'parent': 'body',
        'modal': true,
        'draggable': true,
        'autoShow': false,
        'toolbar': false,
        'title': ''
    };

    metaScore.Dom.extend(Overlay);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    Overlay.prototype.setupUI = function(){

        if(this.configs.modal){
            this.mask = new metaScore.Dom('<div/>', {'class': 'overlay-mask'});
        }

        if(this.configs.toolbar){
            this.toolbar = new metaScore.overlay.Toolbar({'title': this.configs.title})
                .appendTo(this);

            this.toolbar.addButton('close')
                .addListener('click', metaScore.Function.proxy(this.onCloseClick, this));
        }

        this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
            .appendTo(this);

        if(this.configs.draggable){
            this.draggable = new metaScore.Draggable({
                'target': this,
                'handle': this.configs.toolbar ? this.toolbar : this
            });
        }

    };

    /**
     * Show the overlay
     *
     * @method show
     * @chainable
     */
    Overlay.prototype.show = function(){
        if(this.configs.modal){
            this.mask.appendTo(this.configs.parent);
        }

        this.appendTo(this.configs.parent);

        this.triggerEvent(EVT_SHOW, {'overlay': this}, true, false);

        return this;
    };

    /**
     * Hide the overlay
     *
     * @method hide
     * @chainable
     */
    Overlay.prototype.hide = function(){
        if(this.configs.modal){
            this.mask.remove();
        }

        this.remove();

        this.triggerEvent(EVT_HIDE, {'overlay': this}, true, false);

        return this;
    };

    /**
     * Get the overlay's toolbar
     *
     * @method getToolbar
     * @return {editor.Toolbar} The toolbar
     */
    Overlay.prototype.getToolbar = function(){
        return this.toolbar;
    };

    /**
     * Get the overlay's contents
     *
     * @method getContents
     * @return {Dom} The contents
     */
    Overlay.prototype.getContents = function(){
        return this.contents;
    };

    /**
     * The close button's click handler
     *
     * @method onCloseClick
     * @private
     * @param {Event} evt The event object
     */
    Overlay.prototype.onCloseClick = function(evt){
        this.hide();
    };

    return Overlay;

})();
/**
 * @module Core
 */

metaScore.Resizable = (function () {

    /**
     * Fired when a resize started
     *
     * @event resizestart
     */
    var EVT_RESIZESTART = 'resizestart';

    /**
     * Fired when a resize occured
     *
     * @event resize
     */
    var EVT_RESIZE = 'resize';

    /**
     * Fired when a resize ended
     *
     * @event resizeend
     */
    var EVT_RESIZEEND = 'resizeend';

    /**
     * A class for adding resizable behaviors
     * 
     * @class Resizable
     * @extends Class
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Dom} configs.target The Dom object to add the behavior to
     * @param {Object} [configs.directions={'top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'}] The directions at which a resize is allowed 
     */
    function Resizable(configs) {
        this.configs = this.getConfigs(configs);

        this.doc = new metaScore.Dom(this.configs.target.get(0).ownerDocument);

        this.handles = {};

        // fix event handlers scope
        this.onMouseDown = metaScore.Function.proxy(this.onMouseDown, this);
        this.onMouseMove = metaScore.Function.proxy(this.onMouseMove, this);
        this.onMouseUp = metaScore.Function.proxy(this.onMouseUp, this);

        metaScore.Array.each(this.configs.directions, function(index, direction){
            this.handles[direction] = new metaScore.Dom('<div/>', {'class': 'resize-handle'})
                .data('direction', direction)
                .addListener('mousedown', this.onMouseDown)
                .appendTo(this.configs.target);
        }, this);

        this.enable();
    }

    Resizable.defaults = {
        'target': null,
        'directions': [
            'top',
            'right',
            'bottom',
            'left',
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right'
        ]
    };

    metaScore.Class.extend(Resizable);

    /**
     * The mousedown event handler
     * 
     * @method onMouseDown
     * @private
     * @param {Event} evt The event object
     */
    Resizable.prototype.onMouseDown = function(evt){
        if(!this.enabled){
            return;
        }

        this.start_state = {
            'handle': evt.target,
            'x': evt.clientX,
            'y': evt.clientY,
            'left': parseInt(this.configs.target.css('left'), 10),
            'top': parseInt(this.configs.target.css('top'), 10),
            'w': parseInt(this.configs.target.css('width'), 10),
            'h': parseInt(this.configs.target.css('height'), 10)
        };

        this.doc
            .addListener('mousemove', this.onMouseMove, this)
            .addListener('mouseup', this.onMouseUp, this);

        this.configs.target
            .addClass('resizing')
            .triggerEvent(EVT_RESIZESTART, null, false, true);

        evt.stopPropagation();
    };

    /**
     * The mousemove event handler
     * 
     * @method onMouseMove
     * @private
     * @param {Event} evt The event object
     */
    Resizable.prototype.onMouseMove = function(evt){
        var handle = new metaScore.Dom(this.start_state.handle),
            w, h, top, left;

        switch(handle.data('direction')){
            case 'top':
                h = this.start_state.h - evt.clientY + this.start_state.y;
                top = this.start_state.top + evt.clientY    - this.start_state.y;
                break;
            case 'right':
                w = this.start_state.w + evt.clientX - this.start_state.x;
                break;
            case 'bottom':
                h = this.start_state.h + evt.clientY - this.start_state.y;
                break;
            case 'left':
                w = this.start_state.w - evt.clientX + this.start_state.x;
                left = this.start_state.left + evt.clientX - this.start_state.x;
                break;
            case 'top-left':
                w = this.start_state.w - evt.clientX + this.start_state.x;
                h = this.start_state.h - evt.clientY + this.start_state.y;
                top = this.start_state.top + evt.clientY    - this.start_state.y;
                left = this.start_state.left + evt.clientX - this.start_state.x;
                break;
            case 'top-right':
                w = this.start_state.w + evt.clientX - this.start_state.x;
                h = this.start_state.h - evt.clientY + this.start_state.y;
                top = this.start_state.top + evt.clientY - this.start_state.y;
                break;
            case 'bottom-left':
                w = this.start_state.w - evt.clientX + this.start_state.x;
                h = this.start_state.h + evt.clientY - this.start_state.y;
                left = this.start_state.left + evt.clientX - this.start_state.x;
                break;
            case 'bottom-right':
                w = this.start_state.w + evt.clientX - this.start_state.x;
                h = this.start_state.h + evt.clientY - this.start_state.y;
                break;
        }

        if(top !== undefined){
            this.configs.target.css('top', top +'px');
        }
        if(left !== undefined){
            this.configs.target.css('left', left +'px');
        }

        this.configs.target
            .css('width', w +'px')
            .css('height', h +'px')
            .triggerEvent(EVT_RESIZE, null, false, true);

        evt.stopPropagation();
    };

    /**
     * The mouseup event handler
     * 
     * @method onMouseUp
     * @private
     * @param {Event} evt The event object
     */
    Resizable.prototype.onMouseUp = function(evt){
        this.doc
            .removeListener('mousemove', this.onMouseMove, this)
            .removeListener('mouseup', this.onMouseUp, this);

        this.configs.target
            .removeClass('resizing')
            .triggerEvent(EVT_RESIZEEND, null, false, true);

        evt.stopPropagation();
    };

    /**
     * Get a handle
     * @method getHandle
     * @param {String} direction The direction of the handle to get
     * @return {Dom} The handle
     */
    Resizable.prototype.getHandle = function(direction){
        return this.handles[direction];
    };

    /**
     * Enable the behavior
     * 
     * @method enable
     * @chainable
     */
    Resizable.prototype.enable = function(){
        this.configs.target.addClass('resizable');

        this.enabled = true;

        return this;
    };

    /**
     * Disable the behavior
     * 
     * @method disable
     * @chainable
     */
    Resizable.prototype.disable = function(){
        this.configs.target.removeClass('resizable');

        this.enabled = false;

        return this;
    };

    /**
     * Destroy the behavior
     * 
     * @method destroy
     * @chainable
     */
    Resizable.prototype.destroy = function(){
        this.disable();

        metaScore.Object.each(this.handles, function(index, handle){
            handle.remove();
        }, this);

        return this;
    };

    return Resizable;

})();
/**
 * @module Core
 */

metaScore.String = (function () {

    /**
     * A class for string helper functions
     * 
     * @class String
     * @constructor
     */
    function String() {
    }

    /**
     * Capitalize a string
     * 
     * @method capitalize
     * @param {String} str The string to capitalize
     * @return {String} The capitalized string
     */
    String.capitalize = function(str){
        return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    };

    /**
     * Generate a random uuid
     * 
     * @method uuid
     * @author Broofa <robert@broofa.com> (http://www.broofa.com/2008/09/javascript-uuid-function/)
     * @param {Integer} [len] The desired number of characters
     * @param {Integer} [radix] The number of allowable values for each character
     * @return {String} The generated uuid
     *
     * @exqmple
     *    var id = metaScore.String.uuid();
     *    // "66209871-857D-4A12-AC7E-E9EEBC2A6AC3"
     *
     * @exqmple
     *    var id = metaScore.String.uuid(5);
     *    // "kryIh"
     *
     * @exqmple
     *    var id = metaScore.String.uuid(5, 2);
     *    // "10100"
     */
    String.uuid = function(len, radix) {
        var chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
            uuid = [], i;

        radix = radix || chars.length;

        if (len) {
            // Compact form
            for (i = 0; i < len; i++){
                uuid[i] = chars[0 | Math.random() * radix];
            }
        }
        else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data.    At i==19 set the high bits of clock sequence as per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random()*16;
                    uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    };

    /**
     * Pad a string with another string
     * 
     * @method pad
     * @param {String} str The string to pad
     * @param {Integer} len The desired final string length
     * @param {String} [pad=" "] The string to pad with
     * @param {String} [dir="right"] The padding direction ("right", "left" or "both")
     * @return {String} The padded string
     *
     * @exqmple
     *    var str = "a";
     *    var padded = metaScore.String.pad(str, 3, "b");
     *    // "abb"
     *
     * @exqmple
     *    var str = "a";
     *    var padded = metaScore.String.pad(str, 3, "b", "left");
     *    // "bba"
     *
     * @exqmple
     *    var str = "a";
     *    var padded = metaScore.String.pad(str, 3, "b", "both");
     *    // "bab"
     */
    String.pad = function(str, len, pad, dir) {
        var right, left,
            padlen;

        if (typeof(len) === "undefined") { len = 0; }
        if (typeof(pad) === "undefined") { pad = ' '; }
        if (typeof(dir) === "undefined") { dir = 'right'; }

        str = str +'';

        if (len + 1 >= str.length) {
            switch (dir){
                case 'left':
                    str = Array(len + 1 - str.length).join(pad) + str;
                    break;

                case 'both':
                    padlen = len - str.length;
                    right = Math.ceil(padlen / 2);
                    left = padlen - right;
                    str = Array(left+1).join(pad) + str + Array(right+1).join(pad);
                    break;

                default:
                    str = str + Array(len + 1 - str.length).join(pad);
                    break;
            }
        }
        return str;
    };

    return String;

})();
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
/**
 * @module Core
 */

metaScore.Var = (function () {

    /**
     * A class for variable helper functions
     * 
     * @class Var
     * @constructor
     */
    function Var() {
    }

    /**
     * A list of variable type correspondances
     *
     * @property classes2types
     * @type {Object}
     * @static
     * @private
     */
    Var.classes2types = {
        "[object Boolean]": "boolean",
        "[object Number]": "number",
        "[object String]": "string",
        "[object Function]": "function",
        "[object Array]": "array",
        "[object Date]": "date",
        "[object RegExp]": "regexp",
        "[object Object]": "object"
    };

    /**
     * Get the type of a variable
     * 
     * @method type
     * @static
     * @param {Mixed} obj The variable
     * @return {String} The type of the variable
     */
    Var.type = function(obj) {
        return obj == null ? String(obj) : Var.classes2types[ Object.prototype.toString.call(obj) ] || "object";
    };

    /**
     * Check if a variable is of a certain type
     * 
     * @method is
     * @static
     * @param {Mixed} obj The variable
     * @param {String} type The type to check for
     * @return {Boolean} Whether the variable is of the specified type
     */
    Var.is = function(obj, type) {
        return Var.type(obj) === type.toLowerCase();
    };

    /**
     * Check if a variable is empty
     * 
     * @method isEmpty
     * @static
     * @param {Mixed} obj The variable
     * @return {Boolean} Whether the variable is empty
     */
    Var.isEmpty = function(obj) {
        if(obj === undefined || obj == null){
            return true;
        }

        if(obj.hasOwnProperty('length')){
            return obj.length <= 0;
        }

        if(metaScore.Var.is(obj, 'object')){
            return Object.keys(obj).length <= 0;
        }

        return false;
    };

    return Var;

})();
/**
 * @module Core
 */

metaScore.namespace('overlay').Alert = (function () {

    /**
     * Fired when a button is clicked
     *
     * @event buttonclick
     * @param {Object} alert The alert instance
     * @param {String} action The buttons's action
     */
    var EVT_BUTTONCLICK = 'buttonclick';

    /**
     * An alert overlay to show a simple message with buttons
     *
     * @class Alert
     * @namespace overlay
     * @extends Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.draggable=false] Whether the overlay is draggable
     * @param {String} [configs.text=''] The message's text
     * @param {Array} [configs.buttons={}] The list of buttons as action/label pairs
     */
    function Alert(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Alert.parent.call(this, this.configs);

        this.addClass('alert');
    }

    Alert.defaults = {
        'draggable': false,
        'text': '',
        'buttons': {}
    };

    metaScore.Overlay.extend(Alert);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    Alert.prototype.setupUI = function(){
        // call parent method
        Alert.parent.prototype.setupUI.call(this);

        this.text = new metaScore.Dom('<div/>', {'class': 'text'})
            .appendTo(this.contents);

        if(this.configs.text){
            this.setText(this.configs.text);
        }

        this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .addDelegate('button', 'click', metaScore.Function.proxy(this.onButtonClick, this))
            .appendTo(this.contents);

        if(this.configs.buttons){
            metaScore.Object.each(this.configs.buttons, function(action, label){
                this.addButton(action, label);
            }, this);
        }

    };

    /**
     * Set the message's text
     * 
     * @method setText
     * @param {String} str The message's text
     * @chainable
     */
    Alert.prototype.setText = function(str){
        this.text.text(str);

        return this;
    };

    /**
     * Add a button
     * 
     * @method addButton
     * @param {String} action The button's associated action
     * @param {String} label The button's text label
     * @return {Button} The button object
     */
    Alert.prototype.addButton = function(action, label){
        var button = new metaScore.Button()
            .setLabel(label)
            .data('action', action)
            .appendTo(this.buttons);

        return button;
    };

    /**
     * The button click event handler
     * 
     * @method onButtonClick
     * @private
     * @param {Event} evt The event object
     */
    Alert.prototype.onButtonClick = function(evt){
        var action = new metaScore.Dom(evt.target).data('action');

        this.hide();

        this.triggerEvent(EVT_BUTTONCLICK, {'alert': this, 'action': action}, false);

        evt.stopPropagation();
    };

    return Alert;

})();
/**
 * @module Core
 */

metaScore.namespace('overlay').LoadMask = (function () {

    /**
     * A loading mask
     *
     * @class LoadMask
     * @namespace overlay
     * @extends Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.draggable=false] Whether the mask is draggable
     * @param {String} [configs.text='Loading...'] The text to display
     */
    function LoadMask(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        LoadMask.parent.call(this, this.configs);

        this.addClass('loadmask');

        this.text = new metaScore.Dom('<div/>', {'class': 'text', 'text': this.configs.text})
            .appendTo(this.contents);
    }

    LoadMask.defaults = {
        'draggable': false,
        'text': metaScore.Locale.t('overlay.LoadMask.text', 'Loading...')
    };

    metaScore.Overlay.extend(LoadMask);

    return LoadMask;

})();
/**
 * @module Core
 */

metaScore.namespace('overlay').Toolbar = (function(){

    /**
     * A title toolbar for overlay's
     *
     * @class Toolbar
     * @namespace overlay
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.title=null] The text to display as a title
     */
    function Toolbar(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Toolbar.parent.call(this, '<div/>', {'class': 'toolbar clearfix'});

        this.title = new metaScore.Dom('<div/>', {'class': 'title'})
            .appendTo(this);

        this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .appendTo(this);

        if(this.configs.title){
            this.title.text(this.configs.title);
        }
    }

    Toolbar.defaults = {
        'title': null
    };

    metaScore.Dom.extend(Toolbar);

    /**
     * Get the title's Dom
     * 
     * @method getTitle
     * @return {Dom} The Dom object
     */
    Toolbar.prototype.getTitle = function(){
        return this.title;
    };

    /**
     * Add a button
     * 
     * @method addButton
     * @param {String} action The action associated with the button
     * @return {Button} The created button
     */
    Toolbar.prototype.addButton = function(action){
        var button = new metaScore.Button().data('action', action)
            .appendTo(this.buttons);

        return button;
    };

    /**
     * Get a button by associated action
     * 
     * @method getButton
     * @param {String} action The action associated with the button
     * @return {Dom} The button
     */
    Toolbar.prototype.getButton = function(action){
        return this.buttons.children('[data-action="'+ action +'"]');
    };

    return Toolbar;

})();
/**
 * @module Core
 */

metaScore.namespace('overlay').iFrame = (function () {


    /**
     * An iframe overlay
     *
     * @class iFrame
     * @namespace overlay
     * @extends Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.toolbar=true] Whether to show a toolbar with a title and close button
     * @param {String} [configs.url=null] The iframe's url
     */
    function iFrame(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        iFrame.parent.call(this, this.configs);

        this.addClass('iframe');
    }

    iFrame.defaults = {
        'toolbar': true,
        'url': null
    };

    metaScore.Overlay.extend(iFrame);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    iFrame.prototype.setupUI = function(){
        // call parent method
        iFrame.parent.prototype.setupUI.call(this);

        this.frame = new metaScore.Dom('<iframe/>', {'src': this.configs.url})
            .appendTo(this.contents);
    };

    return iFrame;

})();
/**
 * The Player module defines classes used in player
 *
 * @module Player
 * @main
 */

metaScore.Player = (function(){

    /**
     * Fired when the guide's loading finished successfully
     *
     * @event load
     * @param {Object} player The player instance
     * @param {Object} data The json data loaded
     */
    var EVT_LOAD = 'load';

    /**
       * Fired when the guide's loading failed
       *
       * @event loaderror
       * @param {Object} player The player instance
       */
    var EVT_ERROR = 'error';

    /**
       * Fired when the id is set
       *
       * @event idset
       * @param {Object} player The player instance
       * @param {String} id The guide's id
       */
    var EVT_IDSET = 'idset';

    /**
       * Fired when the vid is set
       *
       * @event revisionset
       * @param {Object} player The player instance
       * @param {Integer} vid The guide's vid
       */
    var EVT_REVISIONSET = 'revisionset';

    /**
       * Fired when the media is added
       *
       * @event mediaadd
       * @param {Object} player The player instance
       * @param {Object} media The media instance
       */
    var EVT_MEDIAADD = 'mediaadd';

    /**
       * Fired when the controller is added
       *
       * @event controlleradd
       * @param {Object} player The player instance
       * @param {Object} controller The controller instance
       */
    var EVT_CONTROLLERADD = 'controlleradd';

    /**
       * Fired when a block is added
       *
       * @event blockadd
       * @param {Object} player The player instance
       * @param {Object} block The block instance
       */
    var EVT_BLOCKADD = 'blockadd';

    /**
       * Fired when the reading index is set
       *
       * @event rindex
       * @param {Object} player The player instance
       * @param {Object} value The reading index value
       */
    var EVT_RINDEX = 'rindex';

    /**
     * Provides the main Player class
     *
     * @class Player
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.url=''] The URL of the guide's JSON data to load
     * @param {Mixed} [configs.container='body'] The HTMLElement, Dom instance, or CSS selector to which the player should be appended
     * @param {Object} [configs.ajax={}] Custom options to send with each AJAX request. See {{#crossLink "Ajax/send:method"}}Ajax.send{{/crossLink}} for available options
     * @param {Boolean} [configs.keyboard=false] Whether to activate keyboard shortcuts or not
     * @param {Boolean} [configs.api=false] Whether to allow API access or not
     */
    function Player(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Player.parent.call(this, '<div></div>', {'class': 'metaScore-player'});

        if(this.configs.api){
            metaScore.Dom.addListener(window, 'message', metaScore.Function.proxy(this.onAPIMessage, this));
        }
        
        this.contextmenu = new metaScore.ContextMenu({'target': this, 'items': {
                'about': {
                    'text': metaScore.Locale.t('player.contextmenu.about', 'metaScore v.!version r.!revision', {'!version': metaScore.getVersion(), '!revision': metaScore.getRevision()})
                },
                'logo': {
                    'class': 'logo'
                }
            }})
            .appendTo(this);

        this.appendTo(this.configs.container);

        this.load();
    }

    Player.defaults = {
        'url': '',
        'container': 'body',
        'ajax': {},
        'keyboard': false,
        'api': false
    };

    metaScore.Dom.extend(Player);

    /**
     * Keydown event callback
     *
     * @method onKeydown
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    Player.prototype.onKeydown = function(evt){
        switch(evt.keyCode){
            case 32: //space-bar
                this.togglePlay();
                evt.preventDefault();
                break;

            case 37: //left
                this.find('.metaScore-component.block:hover .pager .button[data-action="previous"]').triggerEvent('click');
                evt.preventDefault();
                break;

            case 39: //right
                this.find('.metaScore-component.block:hover .pager .button[data-action="next"]').triggerEvent('click');
                evt.preventDefault();
                break;
        }
    };

    /**
     * API message event callback
     *
     * @method onAPIMessage
     * @private
     * @param {MessageEvent} evt The event object
     */
    Player.prototype.onAPIMessage = function(evt){
        var player = this,
            data, source, origin, method, params, dom;

        try {
            data = JSON.parse(evt.data);
        }
        catch(e){
            return false;
        }

        if (!('method' in data)) {
            return false;
        }

        source = evt.source;
        origin = evt.origin;
        method = data.method;
        params = 'params' in data ? data.params : null;

        switch(method){
            case 'play':
                player.play(params.inTime, params.outTime, params.rIndex);
                break;

            case 'pause':
                player.getMedia().pause();
                break;

            case 'seek':
                player.getMedia().setTime(parseFloat(params.seconds, 10) * 100);
                break;

            case 'page':
                dom = player.getComponent('.block[data-name="'+ params.block +'"]');
                if(dom._metaScore){
                    dom._metaScore.setActivePage(params.index);
                }
                break;

            case 'rindex':
                player.setReadingIndex(!isNaN(params.index) ? params.index : 0);
                break;

            case 'playing':
                source.postMessage(JSON.stringify({
                    'callback': params.callback,
                    'params': player.getMedia().isPlaying()
                }), origin);
                break;

            case 'time':
                source.postMessage(JSON.stringify({
                    'callback': params.callback,
                    'params': player.getMedia().getTime() / 100
                }), origin);
                break;

            case 'addEventListener':
                switch(params.type){
                    case 'ready':
                        player.addListener('load', function(event){
                            source.postMessage(JSON.stringify({
                                'callback': params.callback
                            }), origin);
                        });
                        break;

                    case 'timeupdate':
                        player.addListener(params.type, function(event){
                            source.postMessage(JSON.stringify({
                                'callback': params.callback,
                                'params': event.detail.media.getTime() / 100
                            }), origin);
                        });
                        break;

                    case 'rindex':
                        player.addListener(params.type, function(event){
                            source.postMessage(JSON.stringify({
                                'callback': params.callback,
                                'params': event.detail.value
                            }), origin);
                        });
                        break;
                }
                break;

            case 'removeEventListener':
                break;
        }
    };

    /**
     * Controller button click event callback
     *
     * @method onControllerButtonClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    Player.prototype.onControllerButtonClick = function(evt){
        var action = metaScore.Dom.data(evt.target, 'action');

        switch(action){
            case 'rewind':
                this.getMedia().reset();
                break;

            case 'play':
                this.togglePlay();
                break;
        }

        evt.stopPropagation();
    };

    /**
     * Media loadedmetadata event callback
     *
     * @method onMediaLoadedMetadata
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaLoadedMetadata = function(evt){
        this.getMedia().reset();
    };

    /**
     * Media waiting event callback
     *
     * @method onMediaWaiting
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaWaiting = function(evt){
        this.addClass('media-waiting');
    };

    /**
     * Media seeking event callback
     *
     * @method onMediaSeeking
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaSeeking = function(evt){
        this.addClass('media-waiting');
    };

    /**
     * Media seeked event callback
     *
     * @method onMediaSeeked
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaSeeked = function(evt){
        this.removeClass('media-waiting');
    };

    /**
     * Media playing event callback
     *
     * @method onMediaPlaying
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaPlaying = function(evt){
        this.removeClass('media-waiting');
        
        this.controller.addClass('playing');
    };

    /**
     * Media play event callback
     *
     * @method onMediaPlay
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaPlay = function(evt){
        this.removeClass('media-waiting');
        
        this.controller.addClass('playing');
    };

    /**
     * Media pause event callback
     *
     * @method onMediaPause
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaPause = function(evt){
        this.removeClass('media-waiting');
        
        this.controller.removeClass('playing');
    };

    /**
     * Media timeupdate event callback
     *
     * @method onMediaTimeUpdate
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaTimeUpdate = function(evt){
        var currentTime = evt.detail.media.getTime();

        this.controller.updateTime(currentTime);
    };

    /**
     * Media suspend event callback
     *
     * @method onMediaSuspend
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaSuspend = function(evt){
        this.removeClass('media-waiting');
    };

    /**
     * Media suspend event callback
     *
     * @method onMediaStalled
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaStalled = function(evt){
        this.removeClass('media-waiting');
    };

    /**
     * Media error event callback
     *
     * @method onMediaError
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaError = function(evt){
        var error = evt.target.error,
            text;
        
        this.removeClass('media-waiting');
        
        switch(error.code) {
            case error.MEDIA_ERR_ABORTED:
                text = metaScore.Locale.t('player.onMediaError.Aborted.msg', 'You aborted the media playback.');
                break;
                
            case error.MEDIA_ERR_NETWORK:
                text = metaScore.Locale.t('player.onMediaError.Network.msg', 'A network error caused the media download to fail.');
                break;
                
            case error.MEDIA_ERR_DECODE:
                text = metaScore.Locale.t('player.onMediaError.Decode.msg', 'The media playback was aborted due to a format problem.');
                break;
                
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                text = metaScore.Locale.t('player.onMediaError.NotSupported.msg', 'The media could not be loaded, either because the server or network failed or because the format is not supported.');
                break;
                
            default:
                text = metaScore.Locale.t('player.onMediaError.Default.msg', 'An unknown error occurred.');
                break;
        }
        
        new metaScore.overlay.Alert({
            'parent': this,
            'text': text,
            'buttons': {
                'ok': metaScore.Locale.t('editor.onMediaError.ok', 'OK'),
            },
            'autoShow': true
        });
    };

    /**
     * Block pageactivate event callback
     *
     * @method onPageActivate
     * @private
     * @param {CustomEvent} evt The event object
     */
    Player.prototype.onPageActivate = function(evt){
        var block = evt.target._metaScore,
            page = evt.detail.page,
            basis = evt.detail.basis;

        if(block.getProperty('synched') && (basis !== 'pagecuepoint')){
            this.getMedia().setTime(page.getProperty('start-time'));
        }
    };

    /**
     * Element of type Cursor time event callback
     *
     * @method onCursorElementTime
     * @private
     * @param {CustomEvent} evt The event object
     */
    Player.prototype.onCursorElementTime = function(evt){            
        if(!this.hasClass('editing') || evt.detail.element.hasClass('selected')){
            this.getMedia().setTime(evt.detail.value);
        }
    };

    /**
     * Element of type Text play event callback
     *
     * @method onTextElementPlay
     * @private
     * @param {CustomEvent} evt The event object
     */
    Player.prototype.onTextElementPlay = function(evt){
        this.play(evt.detail.inTime, evt.detail.outTime, evt.detail.rIndex);
    };

    /**
     * Element of type Text page event callback
     *
     * @method onTextElementPage
     * @private
     * @param {CustomEvent} evt The event object
     */
    Player.prototype.onTextElementPage = function(evt){
        var dom;

        dom = this.getComponent('.block[data-name="'+ evt.detail.block +'"]');
        if(dom._metaScore){
            dom._metaScore.setActivePage(evt.detail.index);
        }
    };

    /**
     * Componenet propchange event callback
     *
     * @method onComponenetPropChange
     * @private
     * @param {CustomEvent} evt The event object
     */
    Player.prototype.onComponenetPropChange = function(evt){
        var component = evt.detail.component;

        switch(evt.detail.property){
            case 'start-time':
            case 'end-time':
                component.setCuePoint({
                    'media': this.getMedia()
                });
                break;
        }
    };

    /**
     * loadsuccess event callback
     *
     * @method onLoadSuccess
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    Player.prototype.onLoadSuccess = function(xhr){
        this.json = JSON.parse(xhr.response);

        this.setId(this.json.id)
            .setRevision(this.json.vid);

        this.css = new metaScore.StyleSheet()
            .setInternalValue(this.json.css)
            .appendTo(document.head);

        this.rindex_css = new metaScore.StyleSheet()
            .appendTo(document.head);

        metaScore.Array.each(this.json.blocks, function(index, block){
            switch(block.type){
                case 'media':
                    this.media = this.addMedia(metaScore.Object.extend({}, block, {'type': this.json.type}))
                        .setSources([this.json.media]);
                    break;

                case 'controller':
                    this.controller = this.addController(block);
                    break;

                default:
                    this.addBlock(block);
            }
        }, this);

        if(this.configs.keyboard){
            new metaScore.Dom('body').addListener('keydown', metaScore.Function.proxy(this.onKeydown, this));
        }

        this.removeClass('loading');

        this.triggerEvent(EVT_LOAD, {'player': this, 'data': this.json}, true, false);
    };

    /**
     * loaderror event callback
     *
     * @method onLoadError
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    Player.prototype.onLoadError = function(xhr){
        this.removeClass('loading');

        this.triggerEvent(EVT_ERROR, {'player': this}, true, false);
    };

    /**
     * Load the guide
     *
     * @method load
     * @private
     */
    Player.prototype.load = function(){
        var options;

        this.addClass('loading');

        options = metaScore.Object.extend({}, {
            'success': metaScore.Function.proxy(this.onLoadSuccess, this),
            'error': metaScore.Function.proxy(this.onLoadError, this)
        }, this.configs.ajax);


        metaScore.Ajax.get(this.configs.url, options);
    };

    /**
     * Get the id of the loaded guide
     *
     * @method getId
     * @return {String} The id
     */
    Player.prototype.getId = function(){
        return this.data('id');
    };

    /**
     * Set the id of the loaded guide in a data attribute
     *
     * @method setId
     * @param {String} id The id
     * @param {Boolean} [supressEvent=false] Whether to supress the idset event
     * @chainable
     */
    Player.prototype.setId = function(id, supressEvent){
        this.data('id', id);

        if(supressEvent !== true){
            this.triggerEvent(EVT_IDSET, {'player': this, 'id': id}, true, false);
        }

        return this;
    };

    /**
     * Get the revision id of the loaded guide
     *
     * @method getRevision
     * @return {String} The revision id
     */
    Player.prototype.getRevision = function(){
        return this.data('vid');
    };

    /**
     * Set the revision id of the loaded guide in a data attribute
     *
     * @method setRevision
     * @param {String} id The id
     * @param {Boolean} [supressEvent=false] Whether to supress the revisionset event
     * @chainable
     */
    Player.prototype.setRevision = function(vid, supressEvent){
        this.data('vid', vid);

        if(supressEvent !== true){
            this.triggerEvent(EVT_REVISIONSET, {'player': this, 'vid': vid}, true, false);
        }

        return this;
    };

    /**
     * Get the loaded JSON data
     *
     * @method getData
     * @return {Object} The JSON data
     */
    Player.prototype.getData = function(){
        return this.json;
    };

    /**
     * Get the media instance
     *
     * @method getMedia
     * @return {Media} The media instance
     */
    Player.prototype.getMedia = function(){
        return this.media;
    };

    /**
     * Update the loaded JSON data
     *
     * @method updateData
     * @param {Object} data The data key, value pairs to update
     */
    Player.prototype.updateData = function(data){
        metaScore.Object.extend(this.json, data);

        if('css' in data){
            this.updateCSS(data.css);
        }

        if('media' in data){
            this.getMedia().setSources([data.media]);
        }

        if('vid' in data){
            this.setRevision(data.vid);
        }
    };

    /**
     * Get a component by CSS selector
     *
     * @method getComponent
     * @param {String} selector The CSS selector
     * @return {Component} The component
     */
    Player.prototype.getComponent = function(selector){
        return this.getComponents(selector).get(0);
    };

    /**
     * Get components by CSS selector
     *
     * @method getComponents
     * @param {String} selector The CSS selector
     * @return {Dom} A Dom instance containing the selected components
     */
    Player.prototype.getComponents = function(selector){
        var components;

        components = this.find('.metaScore-component');

        if(selector){
            components = components.filter(selector);
        }

        return components;
    };

    /**
     * Create and add a Media instance
     *
     * @method addMedia
     * @param {Object} configs The configurations to send to the Media class
     * @param {Boolean} [supressEvent=false] Whether to supress the mediadd event or not
     * @return {Media} The Media instance
     */
    Player.prototype.addMedia = function(configs, supressEvent){
        var media = new metaScore.player.component.Media(configs)
            .addListener('loadedmetadata', metaScore.Function.proxy(this.onMediaLoadedMetadata, this))
            .addListener('waiting', metaScore.Function.proxy(this.onMediaWaiting, this))
            .addListener('seeking', metaScore.Function.proxy(this.onMediaSeeking, this))
            .addListener('seeked', metaScore.Function.proxy(this.onMediaSeeked, this))
            .addListener('playing', metaScore.Function.proxy(this.onMediaPlaying, this))
            .addListener('play', metaScore.Function.proxy(this.onMediaPlay, this))
            .addListener('pause', metaScore.Function.proxy(this.onMediaPause, this))
            .addListener('timeupdate', metaScore.Function.proxy(this.onMediaTimeUpdate, this))
            .addListener('suspend', metaScore.Function.proxy(this.onMediaSuspend, this))
            .addListener('stalled', metaScore.Function.proxy(this.onMediaStalled, this))
            .addListener('error', metaScore.Function.proxy(this.onMediaError, this))
            .appendTo(this);

        if(supressEvent !== true){
            this.triggerEvent(EVT_MEDIAADD, {'player': this, 'media': media}, true, false);
        }

        return media;
    };

    /**
     * Create and add a Controller instance
     *
     * @method addController
     * @param {Object} configs The configurations to send to the Controller class
     * @param {Boolean} [supressEvent=false] Whether to supress the controlleradd event or not
     * @return {Controller} The Controller instance
     */
    Player.prototype.addController = function(configs, supressEvent){
        var controller = new metaScore.player.component.Controller(configs)
            .addDelegate('.buttons button', 'click', metaScore.Function.proxy(this.onControllerButtonClick, this))
            .appendTo(this);

        if(supressEvent !== true){
            this.triggerEvent(EVT_CONTROLLERADD, {'player': this, 'controller': controller}, true, false);
        }

        return controller;
    };

    /**
     * Create and add a Block instance
     *
     * @method addBlock
     * @param {Object} configs The configurations to send to the Block class
     * @param {Boolean} [supressEvent=false] Whether to supress the blockadd event or not
     * @return {Block} The Block instance
     */
    Player.prototype.addBlock = function(configs, supressEvent){
        var block, page;

        if(configs instanceof metaScore.player.component.Block){
            block = configs;
            block.appendTo(this);
        }
        else{
            block = new metaScore.player.component.Block(metaScore.Object.extend({}, configs, {
                    'container': this,
                    'listeners': {
                        'propchange': metaScore.Function.proxy(this.onComponenetPropChange, this)
                    }
                }))
                .addListener('pageactivate', metaScore.Function.proxy(this.onPageActivate, this))
                .addDelegate('.element[data-type="Cursor"]', 'time', metaScore.Function.proxy(this.onCursorElementTime, this))
                .addDelegate('.element[data-type="Text"]', 'play', metaScore.Function.proxy(this.onTextElementPlay, this))
                .addDelegate('.element[data-type="Text"]', 'page', metaScore.Function.proxy(this.onTextElementPage, this));
        }

        if(supressEvent !== true){
            this.triggerEvent(EVT_BLOCKADD, {'player': this, 'block': block}, true, false);
        }

        return block;
    };

    /**
     * Update the custom CSS
     *
     * @method updateCSS
     * @param {String} value The custom CSS value
     * @chainable
     */
    Player.prototype.updateCSS = function(value){
        this.css.setInternalValue(value);

        return this;
    };

    /**
     * Toggles the media playing state
     *
     * @method togglePlay
     * @chainable
     */
    Player.prototype.togglePlay = function(){
        var media = this.getMedia();

        if(media.isPlaying()){
            media.pause();
        }
        else{
            media.play();
        }

        return this;
    };

    /**
     * Start playing the media at the current position, or plays a specific extract
     *
     * @method play
     * @param {String} [inTime] The time at which the media should start playing
     * @param {String} [outTime] The time at which the media should stop playing
     * @param {String} [rIndex] A reading index to go to while playing
     * @chainable
     */
    Player.prototype.play = function(inTime, outTime, rIndex){
        var player = this,
            media = this.getMedia();

        if(this.cuepoint){
            this.cuepoint.destroy();
        }

        inTime = parseFloat(inTime);
        outTime = parseFloat(outTime);
        rIndex = parseInt(rIndex);

        if(isNaN(inTime)){
            media.play();
        }
        else{
            this.cuepoint = new metaScore.player.CuePoint({
                'media': media,
                'inTime': inTime,
                'outTime': !isNaN(outTime) ? outTime : null,
                'considerError': true
            })
            .addListener('start', function(evt){
                player.setReadingIndex(!isNaN(rIndex) ? rIndex : 0);
            })
            .addListener('stop', function(evt){
                evt.target.getMedia().pause();
            })
            .addListener('seekout', function(evt){
                evt.target.destroy();
                delete player.cuepoint;

                player.setReadingIndex(0);
            });

            media.setTime(inTime).play();
        }

        return this;
    };

    /**
     * Set the current reading index
     *
     * @method setReadingIndex
     * @param {Integer} index The reading index
     * @param {Boolean} [supressEvent=false] Whether to supress the blockadd event or not
     * @chainable
     */
    Player.prototype.setReadingIndex = function(index, supressEvent){
        this.rindex_css.removeRules();

        if(index !== 0){
            this.rindex_css
                .addRule('.metaScore-component.element[data-r-index="'+ index +'"]', 'display: block;')
                .addRule('.metaScore-component.element[data-r-index="'+ index +'"]:not([data-start-time]), .metaScore-component.element[data-r-index="'+ index +'"].active', 'pointer-events: auto;')
                .addRule('.metaScore-component.element[data-r-index="'+ index +'"]:not([data-start-time]) .contents, .metaScore-component.element[data-r-index="'+ index +'"].active .contents', 'display: block;')
                .addRule('.in-editor.editing.show-contents .metaScore-component.element[data-r-index="'+ index +'"] .contents', 'display: block;');

            this.data('r-index', index);
        }
        else{
            this.data('r-index', null);
        }

        if(supressEvent !== true){
            this.triggerEvent(EVT_RINDEX, {'player': this, 'value': index}, true, false);
        }

        return this;
    };

    return Player;

})();
/**
 * @module Player
 */

metaScore.namespace('player').Component = (function () {

    /**
     * Fired when a property changed
     *
     * @event propchange
     * @param {Object} component The component instance
     * @param {String} property The name of the property
     * @param {Mixed} value The new value of the property
     */
    var EVT_PROPCHANGE = 'propchange';

    /**
     * A generic component class
     * 
     * @class Component
     * @namespace player
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.container=null The Dom instance to which the component should be appended
     * @param {Integer} [configs.index=null The index position at which the component should be appended
     * @param {Object} [configs.properties={}} A list of the component properties as name/descriptor pairs
     */
    function Component(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Component.parent.call(this, '<div/>', {'class': 'metaScore-component', 'id': 'component-'+ metaScore.String.uuid(5)});

        // keep a reference to this class instance in the DOM node
        this.get(0)._metaScore = this;

        if(this.configs.container){
            if(metaScore.Var.is(this.configs.index, 'number')){
                this.insertAt(this.configs.container, this.configs.index);
            }
            else{
                this.appendTo(this.configs.container);
            }
        }

        metaScore.Object.each(this.configs.listeners, function(key, value){
            this.addListener(key, value);
        }, this);

        this.setupUI();

        this.setProperties(this.configs);
    }

    metaScore.Dom.extend(Component);

    Component.defaults = {
        'container': null,
        'index': null,
        'properties': {}
    };

    /**
     * Setup the component's UI
     * 
     * @method setupUI
     * @private
     */
    Component.prototype.setupUI = function(){};

    /**
     * Get the component's id
     * 
     * @method getId
     * @return {String} The id
     */
    Component.prototype.getId = function(){
        return this.attr('id');
    };

    /**
     * Get the value of the component's name property
     * 
     * @method getName
     * @return {String} The name
     */
    Component.prototype.getName = function(){
        return this.getProperty('name');
    };

    /**
     * Check if the component is of a given type
     * 
     * @method instanceOf
     * @param {String} type The type to check for
     * @return {Boolean} Whether the component is of the given type
     */
    Component.prototype.instanceOf = function(type){
        return (type in metaScore.player.component) && (this instanceof metaScore.player.component[type]);
    };

    /**
     * Check if the component has a given property
     * 
     * @method hasProperty
     * @param {String} name The property's name
     * @return {Boolean} Whether the component has the given property
     */
    Component.prototype.hasProperty = function(name){
        return name in this.configs.properties;
    };

    /**
     * Get the value of a given property
     * 
     * @method getProperty
     * @param {String} name The name of the property
     * @return {Mixed} The value of the property
     */
    Component.prototype.getProperty = function(name){
        if(this.hasProperty(name) && 'getter' in this.configs.properties[name]){
            return this.configs.properties[name].getter.call(this);
        }
    };

    /**
     * Get the values of all properties
     * 
     * @method getProperties
     * @param {Boolean} skipDefaults Whether to skip properties that have the default value
     * @return {Object} The values of the properties as name/value pairs
     */
    Component.prototype.getProperties = function(skipDefaults){
        var values = {},
            value;

        metaScore.Object.each(this.configs.properties, function(name, prop){
            if('getter' in prop){
                value = prop.getter.call(this, skipDefaults);

                if(value !== null){
                    values[name] = value;
                }
            }
        }, this);

        return values;
    };

    /**
     * Set the value of a given property
     * 
     * @method setProperty
     * @param {String} name The name of the property
     * @param {Mixed} value The value to set
     * @param {Boolean} [supressEvent=false] Whether to supress the propchange event
     * @chainable
     */
    Component.prototype.setProperty = function(name, value, supressEvent){
        if(name in this.configs.properties && 'setter' in this.configs.properties[name]){
            this.configs.properties[name].setter.call(this, value);

            if(supressEvent !== true){
                this.triggerEvent(EVT_PROPCHANGE, {'component': this, 'property': name, 'value': value});
            }
        }

        return this;
    };

    /**
     * Set property values
     * 
     * @method setProperties
     * @param {Object} properties The list of properties to set as name/value pairs
     * @param {Boolean} [supressEvent=false] Whether to supress the propchange event
     * @chainable
     */
    Component.prototype.setProperties = function(properties, supressEvent){
        metaScore.Object.each(properties, function(key, value){
            this.setProperty(key, value, supressEvent);
        }, this);

        return this;
    };

    /**
     * Set a cuepoint on the component
     * 
     * @method setCuePoint
     * @param {Object} configs Custom configs to override defaults
     * @return {player.CuePoint} The created cuepoint
     */
    Component.prototype.setCuePoint = function(configs){
        var inTime = this.getProperty('start-time'),
            outTime = this.getProperty('end-time');

        if(this.cuepoint){
            this.cuepoint.destroy();
        }

        if(inTime != null || outTime != null){
            this.cuepoint = new metaScore.player.CuePoint(metaScore.Object.extend({}, configs, {
                'inTime': inTime,
                'outTime': outTime
            }));
            
            if(this.onCuePointStart){
                this.cuepoint.addListener('start', metaScore.Function.proxy(this.onCuePointStart, this));
            }
            
            if(this.onCuePointUpdate){
                this.cuepoint.addListener('update', metaScore.Function.proxy(this.onCuePointUpdate, this));
            }
            
            if(this.onCuePointStop){
                this.cuepoint.addListener('stop', metaScore.Function.proxy(this.onCuePointStop, this));
            }
        }

        return this.cuepoint;
    };

    return Component;

})();
/**
 * @module Player
 */

metaScore.namespace('player').CuePoint = (function () {

    /**
     * Fired when the cuepoint starts
     *
     * @event start
     */
    var EVT_START = 'start';

    /**
     * Fired when the cuepoint is active (between the start and end times) and the media time is updated
     *
     * @event update
     */
    var EVT_UPDATE = 'update';

    /**
     * Fired when the cuepoint stops
     *
     * @event stop
     */
    var EVT_STOP = 'stop';

    /**
     * Fired when the media is seeked outside of the cuepoint's time
     *
     * @event seekout
     */
    var EVT_SEEKOUT = 'seekout';

    /**
     * A class for managing media cuepoints to execute actions at specific media times
     * 
     * @class CuePoint
     * @namepsace player
     * @extends Evented
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {player.component.Media} configs.media The media component to which the cuepoint is attached
     * @param {Number} configs.inTime The time at which the cuepoint starts
     * @param {Number} [onfigs.outTime] The time at which the cuepoint stops
     * @param {Boolean} [onfigs.considerError] Whether to estimate and use the error margin in timed events
     */
    function CuePoint(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        CuePoint.parent.call(this);

        this.id = metaScore.String.uuid();

        this.running = false;

        this.start = metaScore.Function.proxy(this.start, this);
        this.stop = metaScore.Function.proxy(this.stop, this);
        this.onMediaTimeUpdate = metaScore.Function.proxy(this.onMediaTimeUpdate, this);
        this.onMediaSeeked = metaScore.Function.proxy(this.onMediaSeeked, this);

        this.getMedia()
            .addListener('timeupdate', this.onMediaTimeUpdate)
            .addListener('seeked', this.onMediaSeeked);

        this.max_error = 0;
    }

    metaScore.Evented.extend(CuePoint);

    CuePoint.defaults = {
        'media': null,
        'inTime': null,
        'outTime': null,
        'considerError': false
    };

    /**
     * The media's timeupdate event handler
     * 
     * @method onMediaTimeUpdate
     * @private
     * @param {Event} evt The event object
     */
    CuePoint.prototype.onMediaTimeUpdate = function(evt){
        var cur_time = this.getMedia().getTime();

        if(!this.running){
            if((Math.floor(cur_time) >= this.configs.inTime) && ((this.configs.outTime === null) || (Math.ceil(cur_time) < this.configs.outTime))){
                this.start();
            }
        }
        else{
            if(this.configs.considerError){
                if('previous_time' in this){
                    this.max_error = Math.max(this.max_error, Math.abs(cur_time - this.previous_time));
                }

                this.previous_time = cur_time;
            }

            if((this.configs.outTime !== null) && (Math.floor(cur_time + this.max_error) >= this.configs.outTime)){
                this.stop();
            }

            this.triggerEvent(EVT_UPDATE);
        }
    };

    /**
     * The media's seek event handler
     * 
     * @method onMediaSeeked
     * @private
     * @param {Event} evt The event object
     */
    CuePoint.prototype.onMediaSeeked = function(evt){
        var cur_time = this.getMedia().getTime();
        
        if('previous_time' in this){
            // reset the max_error and the previous_time to prevent an abnormaly large max_error
            this.max_error = 0;
            this.previous_time = cur_time;
        }

        if((Math.ceil(cur_time) < this.configs.inTime) || (Math.floor(cur_time) > this.configs.outTime)){
            this.triggerEvent(EVT_SEEKOUT);
            this.stop();
        }
    };

    /**
     * Get the media component on which this cuepoint is attached
     * 
     * @method getMedia
     * @return {player.component.Media} The media component
     */
    CuePoint.prototype.getMedia = function(){
        return this.configs.media;
    };

    /**
     * Start executing the cuepoint
     * 
     * @method start
     * @private
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     */
    CuePoint.prototype.start = function(supressEvent){
        if(this.running){
            return;
        }

        if(supressEvent !== true){
            this.triggerEvent(EVT_START);
        }

        // stop the cuepoint if it doesn't have an outTime
        if(this.configs.outTime === null){
            this.stop();
        }
        else{            
            this.running = true;
        }

    };

    /**
     * Stop executing the cuepoint
     * 
     * @method stop
     * @private
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     */
    CuePoint.prototype.stop = function(supressEvent){
        if(!this.running){
            return;
        }
        
        if(supressEvent !== true){
            this.triggerEvent(EVT_STOP);
        }

        if(this.configs.considerError){
            this.max_error = 0;
            delete this.previous_time;
        }

        this.running = false;
    };

    /**
     * Destroy the cuepoint
     * 
     * @method destroy
     */
    CuePoint.prototype.destroy = function(){
        this.stop(true);

        this.getMedia()
            .removeListener('timeupdate', this.onMediaTimeUpdate)
            .removeListener('seeked', this.onMediaSeeked);
    };

    return CuePoint;

})();
/**
 * @module Player
 */

metaScore.namespace('player').Pager = (function () {

    /**
     * A pager for block components
     *
     * @class Pager
     * @namespace player
     * @extends Dom
     * @constructor
     */
    function Pager() {
        // call parent constructor
        Pager.parent.call(this, '<div/>', {'class': 'pager'});

        this.count = new metaScore.Dom('<div/>', {'class': 'count'})
            .appendTo(this);

        this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .addListener('mousedown', function(evt){
                evt.stopPropagation();
            })
            .appendTo(this);

        this.buttons.first = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'first'})
            .appendTo(this.buttons);
        this.buttons.previous = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'previous'})
            .appendTo(this.buttons);
        this.buttons.next = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'next'})
            .appendTo(this.buttons);
    }

    metaScore.Dom.extend(Pager);

    /**
     * Update the page counter
     * 
     * @method updateCount
     * @param {Integer} index The index of the block's active page
     * @param {Integer} count The number of pages
     * @chainable
     */
    Pager.prototype.updateCount = function(index, count){
        this.count.text(metaScore.Locale.t('player.Pager.count', 'page !current/!count', {'!current': (index + 1), '!count': count}));

        this.buttons.first.toggleClass('inactive', index < 1);
        this.buttons.previous.toggleClass('inactive', index < 1);
        this.buttons.next.toggleClass('inactive', index >= count - 1);

        return this;
    };

    return Pager;

})();
/**
 * @module Player
 */

metaScore.namespace('player.component').Block = (function () {

    /**
     * Fired when a page is added
     *
     * @event pageadd
     * @param {Object} block The block instance
     * @param {Object} page The page instance
     */
    var EVT_PAGEADD = 'pageadd';

    /**
     * Fired when a page is removed
     *
     * @event pageremove
     * @param {Object} block The block instance
     * @param {Object} page The page instance
     */
    var EVT_PAGEREMOVE = 'pageremove';

    /**
     * Fired when the active page is set
     *
     * @event pageactivate
     * @param {Object} block The block instance
     * @param {Object} page The page instance
     * @param {String} basis The reason behind this action
     */
    var EVT_PAGEACTIVATE = 'pageactivate';

    /**
     * A block component
     *
     * @class Block
     * @namespace player.component
     * @extends player.Component
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    function Block(configs) {
        // call parent constructor
        Block.parent.call(this, configs);
    }

    metaScore.player.Component.extend(Block);

    Block.defaults = {
        'properties': {
            'name': {
                'type': 'Text',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.name', 'Name')
                },
                'getter': function(skipDefault){
                    return this.data('name');
                },
                'setter': function(value){
                    this.data('name', value);
                }
            },
            'locked': {
                'type': 'Boolean',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.locked', 'Locked ?')
                },
                'getter': function(skipDefault){
                    return this.data('locked') === "true";
                },
                'setter': function(value){
                    this.data('locked', value ? "true" : null);
                }
            },
            'x': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.x', 'X'),
                    'spinDirection': 'vertical'
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('left'), 10);
                },
                'setter': function(value){
                    this.css('left', value +'px');
                }
            },
            'y': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.y', 'Y'),
                    'flipSpinButtons': true
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('top'), 10);
                },
                'setter': function(value){
                    this.css('top', value +'px');
                },
            },
            'width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.width', 'Width'),
                    'spinDirection': 'vertical'
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('width'), 10);
                },
                'setter': function(value){
                    this.css('width', value +'px');
                }
            },
            'height': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.height', 'Height'),
                    'flipSpinButtons': true
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('height'), 10);
                },
                'setter': function(value){
                    this.css('height', value +'px');
                }
            },
            'z-index': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.z-index', 'Display index')
                },
                'getter': function(skipDefault){
                    var value = parseInt(this.css('z-index', undefined, skipDefault), 10);
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.css('z-index', value);
                }
            },
            'background-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.background-color', 'Background color')
                },
                'getter': function(skipDefault){
                    return this.css('background-color', undefined, skipDefault);
                },
                'setter': function(value){
                    var color = metaScore.Color.parse(value);
                    this.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
                }
            },
            'background-image': {
                'type':'Image',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.background-image', 'Background image')
                },
                'getter': function(skipDefault){
                    var value = this.css('background-image', undefined, skipDefault);

                    if(value === 'none' || !metaScore.Var.is(value, "string")){
                        return null;
                    }

                    return value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                },
                'setter': function(value){
                    value = (value !== 'none' && metaScore.Var.is(value, "string") && (value.length > 0)) ? 'url('+ value +')' : null;
                    this.css('background-image', value);
                }
            },
            'border-width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.border-width', 'Border width'),
                    'min': 0
                },
                'getter': function(skipDefault){
                    var value = parseInt(this.css('border-width', undefined, skipDefault), 10);
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.css('border-width', value +'px');
                }
            },
            'border-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.border-color', 'Border color')
                },
                'getter': function(skipDefault){
                    return this.css('border-color', undefined, skipDefault);
                },
                'setter': function(value){
                    var color = metaScore.Color.parse(value);
                    this.css('border-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
                }
            },
            'border-radius': {
                'type': 'BorderRadius',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.border-radius', 'Border radius')
                },
                'getter': function(skipDefault){
                    return this.css('border-radius', undefined, skipDefault);
                },
                'setter': function(value){
                    this.css('border-radius', value);
                }
            },
            'synched': {
                'editable': false,
                'getter': function(skipDefault){
                    return this.data('synched') === "true";
                },
                'setter': function(value){
                    this.data('synched', value);
                }
            },
            'pages': {
                'editable':false,
                'getter': function(skipDefault){
                    var pages = [];

                    metaScore.Array.each(this.getPages(), function(index, page){
                        pages.push(page.getProperties(skipDefault));
                    });

                    return pages;
                },
                'setter': function(value){
                    this.removePages();

                    metaScore.Array.each(value, function(index, configs){
                        this.addPage(configs);
                    }, this);

                    this.setActivePage(0);
                }
            }
        }
    };

    /**
     * Setup the block's UI
     * 
     * @method setupUI
     * @private
     */
    Block.prototype.setupUI = function(){
        // call parent function
        Block.parent.prototype.setupUI.call(this);

        this.addClass('block');

        this.page_wrapper = new metaScore.Dom('<div/>', {'class': 'pages'})
            .addDelegate('.page', 'cuepointstart', metaScore.Function.proxy(this.onPageCuePointStart, this))
            .appendTo(this);

        this.pager = new metaScore.player.Pager()
            .addDelegate('.button', 'click', metaScore.Function.proxy(this.onPagerClick, this))
            .appendTo(this);
    };

    /**
     * Page cuepointstart event handler
     *
     * @method onPageCuePointStart
     * @private
     * @param {Event} evt The event object
     */
    Block.prototype.onPageCuePointStart = function(evt){
        this.setActivePage(evt.target._metaScore, 'pagecuepoint');
    };

    /**
     * Pager click event handler
     *
     * @method onPagerClick
     * @private
     * @param {Event} evt The event object
     */
    Block.prototype.onPagerClick = function(evt){
        var active = !metaScore.Dom.hasClass(evt.target, 'inactive'),
            action;

        if(active){
            action = metaScore.Dom.data(evt.target, 'action');

            switch(action){
                case 'first':
                    this.setActivePage(0);
                    break;
                case 'previous':
                    this.setActivePage(this.getActivePageIndex() - 1);
                    break;
                case 'next':
                    this.setActivePage(this.getActivePageIndex() + 1);
                    break;
            }
        }

        evt.stopPropagation();
    };

    /**
     * Get the block's pages
     *
     * @method getPages
     * @return {Array} List of pages
     */
    Block.prototype.getPages = function(){
        var pages = [];

        this.page_wrapper.children('.page').each(function(index, dom){
            pages.push(dom._metaScore);
        });

        return pages;
    };

    /**
     * Add a page
     *
     * @method addPage
     * @params {Mixed} configs Page configs or a player.component.Page instance
     * @params {Integer} index The new page's index
     * @param {Boolean} [supressEvent=false] Whether to supress the pageadd event
     * @return {player.component.Page} The added page
     */
    Block.prototype.addPage = function(configs, index, supressEvent){
        var page;

        if(configs instanceof metaScore.player.component.Page){
            page = configs;

            if(metaScore.Var.is(index, 'number')){
                page.insertAt(this.page_wrapper, index);
            }
            else{
                page.appendTo(this.page_wrapper);
            }
        }
        else{
            page = new metaScore.player.component.Page(metaScore.Object.extend({}, configs, {
                'container': this.page_wrapper,
                'index': index
            }));
        }

        this.setActivePage(page);

        if(supressEvent !== true){
            this.triggerEvent(EVT_PAGEADD, {'block': this, 'page': page});
        }

        return page;
    };

    /**
     * Remove a page
     *
     * @method removePage
     * @params {player.component.Page} page The page to remove
     * @param {Boolean} [supressEvent=false] Whether to supress the pageremove event
     * @return {player.component.Page} The removed page
     */
    Block.prototype.removePage = function(page, supressEvent){
        var index;

        page.remove();

        if(supressEvent !== true){
            this.triggerEvent(EVT_PAGEREMOVE, {'block': this, 'page': page});
        }

        return page;
    };

    /**
     * Remove all pages
     *
     * @method removePages
     * @chainable
     */
    Block.prototype.removePages = function(){
        this.page_wrapper.children('.page').remove();

        return this;
    };

    /**
     * Get a page by index
     *
     * @method getPage
     * @param {Integer} index The page's index
     * @return {player.component.Page} The page
     */
    Block.prototype.getPage = function(index){        
        var page = this.page_wrapper.child('.page:nth-child('+ (index+1) +')').get(0);
        
        return page ? page._metaScore : null;
    };

    /**
     * Get the currently active page
     *
     * @method getActivePage
     * @return {player.component.Page} The page
     */
    Block.prototype.getActivePage = function(){
        return this.getPage(this.getActivePageIndex());
    };

    /**
     * Get the index of the currently active page
     *
     * @method getActivePageIndex
     * @return {Integer} The index
     */
    Block.prototype.getActivePageIndex = function(){
        return this.page_wrapper.children('.page').index('.active');
    };

    /**
     * Get the page count
     *
     * @method getPageCount
     * @return {Integer} The number of pages
     */
    Block.prototype.getPageCount = function(){
        return this.page_wrapper.children('.page').count();
    };

    /**
     * Set the active page
     *
     * @method setActivePage
     * @param {Mixed} page The page to activate or its index
     * @param {Boolean} [supressEvent=false] Whether to supress the pageactivate event
     * @chainable
     */
    Block.prototype.setActivePage = function(page, basis, supressEvent){
        if(metaScore.Var.is(page, 'number')){
            page = this.getPage(page);
        }

        if(page instanceof metaScore.player.component.Page){
            metaScore.Array.each(this.getPages(), function(index, page){
                page.removeClass('active');
            });

            page.addClass('active');
            
            this.updatePager();

            if(supressEvent !== true){
                this.triggerEvent(EVT_PAGEACTIVATE, {'block': this, 'page': page, 'basis': basis});
            }
        }
        
        return this;
    };

    /**
     * Update the pager
     *
     * @method updatePager
     * @private
     * @chainable
     */
    Block.prototype.updatePager = function(){
        var index = this.getActivePageIndex(),
            count = this.getPageCount();

        this.pager.updateCount(index, count);

        this.data('page-count', count);
        
        return this;
    };

    /**
     * Set/Unset the draggable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [draggable=true] Whether to activate or deactivate the draggable
     * @return {Draggable} The draggable behaviour
     */
    Block.prototype.setDraggable = function(draggable){

        draggable = draggable !== false;

        if(this.getProperty('locked') && draggable){
            return false;
        }

        if(draggable && !this._draggable){
            this._draggable = new metaScore.Draggable({
                'target': this,
                'handle': this.child('.pager'),
                'limits': {
                    'top': 0,
                    'left': 0
                }
            });
        }
        else if(!draggable && this._draggable){
            this._draggable.destroy();
            delete this._draggable;
        }

        return this._draggable;

    };

    /**
     * Set/Unset the resizable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [resizable=true] Whether to activate or deactivate the resizable
     * @return {Resizable} The resizable behaviour
     */
    Block.prototype.setResizable = function(resizable){

        resizable = resizable !== false;

        if(this.getProperty('locked') && resizable){
            return false;
        }

        if(resizable && !this._resizable){
            this._resizable = new metaScore.Resizable({
                'target': this
            });
        }
        else if(!resizable && this._resizable){
            this._resizable.destroy();
            delete this._resizable;
        }

        return this._resizable;

    };

    return Block;

})();
/**
 * @module Player
 */

metaScore.namespace('player.component').Controller = (function () {

    /**
     * A controller component
     *
     * @class Controller
     * @namespace player.component
     * @extends player.Component
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    function Controller(configs) {
        // call parent constructor
        Controller.parent.call(this, configs);
    }

    metaScore.player.Component.extend(Controller);

    Controller.defaults = {
        'properties': {
            'locked': {
                'type': 'Boolean',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Controller.locked', 'Locked ?')
                },
                'getter': function(skipDefault){
                    return this.data('locked') === "true";
                },
                'setter': function(value){
                    this.data('locked', value ? "true" : null);
                }
            },
            'x': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Controller.x', 'X'),
                    'spinDirection': 'vertical'
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('left'), 10);
                },
                'setter': function(value){
                    this.css('left', value +'px');
                }
            },
            'y': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Controller.y', 'Y'),
                    'flipSpinButtons': true
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('top'), 10);
                },
                'setter': function(value){
                    this.css('top', value +'px');
                }
            },
            'z-index': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.z-index', 'Display index')
                },
                'getter': function(skipDefault){
                    var value = parseInt(this.css('z-index', undefined, skipDefault), 10);
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.css('z-index', value);
                }
            },
            'border-radius': {
                'type': 'BorderRadius',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Controller.border-radius', 'Border radius')
                },
                'getter': function(skipDefault){
                    return this.css('border-radius', undefined, skipDefault);
                },
                'setter': function(value){
                    this.css('border-radius', value);
                }
            }
        }
    };

    /**
     * Setup the controller's UI
     * 
     * @method setupUI
     * @private
     */
    Controller.prototype.setupUI = function(){
        // call parent function
        Controller.parent.prototype.setupUI.call(this);

        this.addClass('controller');

        this.timer = new metaScore.Dom('<div/>', {'class': 'timer', 'text': '00:00.00'})
            .appendTo(this);

        this.rewind_btn = new metaScore.Dom('<button/>')
            .data('action', 'rewind');

        this.play_btn = new metaScore.Dom('<button/>')
            .data('action', 'play');

        new metaScore.Dom('<div/>', {'class': 'buttons'})
            .append(this.rewind_btn)
            .append(this.play_btn)
            .appendTo(this);
    };

    /**
     * Get the value of the controller's name property
     * 
     * @method getName
     * @return {String} The name
     */
    Controller.prototype.getName = function(){
        return '[controller]';
    };

    /**
     * Update the displayed time
     *
     * @method updateTime
     * @param {Integer} time The time value in centiseconds
     * @chainable
     */
    Controller.prototype.updateTime = function(time){
        var centiseconds = metaScore.String.pad(parseInt(time % 100, 10), 2, '0', 'left'),
            seconds = metaScore.String.pad(parseInt((time / 100) % 60, 10), 2, '0', 'left'),
            minutes = metaScore.String.pad(parseInt((time / 6000), 10), 2, '0', 'left');

        this.timer.text(minutes +':'+ seconds +'.'+ centiseconds);
        
        return this;
    };

    /**
     * Set/Unset the draggable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [draggable=true] Whether to activate or deactivate the draggable
     * @return {Draggable} The draggable behaviour
     */
    Controller.prototype.setDraggable = function(draggable){

        draggable = draggable !== false;

        if(this.getProperty('locked') && draggable){
            return false;
        }

        if(draggable && !this._draggable){
            this._draggable = new metaScore.Draggable({
                'target': this,
                'handle': this.child('.timer'),
                'limits': {
                    'top': 0,
                    'left': 0
                }
            });
        }
        else if(!draggable && this._draggable){
            this._draggable.destroy();
            delete this._draggable;
        }

        return this._draggable;

    };

    return Controller;

})();
/**
 * @module Player
 */

metaScore.namespace('player.component').Element = (function () {

    /**
     * An element component
     *
     * @class Controller
     * @namespace player.component
     * @extends player.Component
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    function Element(configs) {
        // call parent constructor
        Element.parent.call(this, configs);
    }

    metaScore.player.Component.extend(Element);

    Element.defaults = {
        'properties': {
            'name': {
                'type': 'Text',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.name', 'Name')
                },
                'getter': function(skipDefault){
                    return this.data('name');
                },
                'setter': function(value){
                    this.data('name', value);
                }
            },
            'type': {
                'editable':false,
                'getter': function(skipDefault){
                    return this.data('type');
                },
                'setter': function(value){
                    this.data('type', value);
                }
            },
            'locked': {
                'type': 'Boolean',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.locked', 'Locked ?')
                },
                'getter': function(skipDefault){
                    return this.data('locked') === "true";
                },
                'setter': function(value){
                    this.data('locked', value ? "true" : null);
                }
            },
            'x': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.x', 'X'),
                    'spinDirection': 'vertical'
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('left'), 10);
                },
                'setter': function(value){
                    this.css('left', value +'px');
                }
            },
            'y': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.y', 'Y'),
                    'flipSpinButtons': true
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('top'), 10);
                },
                'setter': function(value){
                    this.css('top', value +'px');
                }
            },
            'width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.width', 'Width'),
                    'spinDirection': 'vertical'
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('width'), 10);
                },
                'setter': function(value){
                    this.css('width', value +'px');
                }
            },
            'height': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.height', 'Height'),
                    'flipSpinButtons': true
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('height'), 10);
                },
                'setter': function(value){
                    this.css('height', value +'px');
                }
            },
            'r-index': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.r-index', 'Reading index'),
                    'min': 0
                },
                'getter': function(skipDefault){
                    var value = parseInt(this.data('r-index'), 10);
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.data('r-index', value);
                }
            },
            'z-index': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.z-index', 'Display index')
                },
                'getter': function(skipDefault){
                    var value = parseInt(this.css('z-index', undefined, skipDefault), 10);
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.css('z-index', value);
                }
            },
            'background-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.background-color', 'Background color')
                },
                'getter': function(skipDefault){
                    return this.contents.css('background-color', undefined, skipDefault);
                },
                'setter': function(value){
                    var color = metaScore.Color.parse(value);
                    this.contents.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
                }
            },
            'background-image': {
                'type': 'Image',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.background-image', 'Background image')
                },
                'getter': function(skipDefault){
                    var value = this.contents.css('background-image', undefined, skipDefault);

                    if(value === 'none' || !metaScore.Var.is(value, "string")){
                        return null;
                    }

                    return value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                },
                'setter': function(value){
                    value = (value !== 'none' && metaScore.Var.is(value, "string") && (value.length > 0)) ? 'url('+ value +')' : null;
                    this.contents.css('background-image', value);
                }
            },
            'border-width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.border-width', 'Border width'),
                    'min': 0
                },
                'getter': function(skipDefault){
                    var value = parseInt(this.contents.css('border-width', undefined, skipDefault), 10);
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.contents.css('border-width', value +'px');
                }
            },
            'border-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.border-color', 'Border color')
                },
                'getter': function(skipDefault){
                    return this.contents.css('border-color', undefined, skipDefault);
                },
                'setter': function(value){
                    var color = metaScore.Color.parse(value);
                    this.contents.css('border-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
                }
            },
            'border-radius': {
                'type': 'BorderRadius',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.border-radius', 'Border radius')
                },
                'getter': function(skipDefault){
                    return this.contents.css('border-radius', undefined, skipDefault);
                },
                'setter': function(value){
                    this.contents.css('border-radius', value);
                }
            },
            'opacity': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.opacity', 'Opacity'),
                    'min': 0,
                    'max': 1,
                    'step': 0.1
                },
                'getter': function(skipDefault){
                    return this.contents.css('opacity', undefined, skipDefault);
                },
                'setter': function(value){
                    this.contents.css('opacity', value);
                }
            },
            'start-time': {
                'type': 'Time',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.start-time', 'Start time'),
                    'checkbox': true,
                    'inButton': true,
                    'outButton': true
                },
                'getter': function(skipDefault){
                    var value = parseFloat(this.data('start-time'));
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.data('start-time', isNaN(value) ? null : value);
                }
            },
            'end-time': {
                'type': 'Time',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.end-time', 'End time'),
                    'checkbox': true,
                    'inButton': true,
                    'outButton': true
                },
                'getter': function(skipDefault){
                    var value = parseFloat(this.data('end-time'));
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.data('end-time', isNaN(value) ? null : value);
                }
            }
        }
    };

    /**
     * Setup the element's UI
     * 
     * @method setupUI
     * @private
     */
    Element.prototype.setupUI = function(){
        // call parent function
        Element.parent.prototype.setupUI.call(this);

        this.addClass('element');

        this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
            .appendTo(this);
    };

    /**
     * Get the page component this element belongs to
     *
     * @method getPage
     * @return {player.component.Page} The page
     */
    Element.prototype.getPage = function(){
        var dom = this.parents().get(0),
            page;

        if(dom){
            page = dom._metaScore;
        }
        
        return page;
    };

    /**
     * The cuepoint start event handler
     *
     * @method onCuePointStart
     * @private
     * @param {Event} evt The event object
     */
    Element.prototype.onCuePointStart = function(evt){
        this.addClass('active');
    };

    /**
     * The cuepoint stop event handler
     *
     * @method onCuePointStop
     * @private
     * @param {Event} evt The event object
     */
    Element.prototype.onCuePointStop = function(evt){
        this.removeClass('active');
    };

    /**
     * Set/Unset the draggable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [draggable=true] Whether to activate or deactivate the draggable
     * @return {Draggable} The draggable behaviour
     */
    Element.prototype.setDraggable = function(draggable){

        draggable = draggable !== false;

        if(this.getProperty('locked') && draggable){
            return false;
        }

        if(draggable && !this._draggable){
            this._draggable = new metaScore.Draggable({
                'target': this,
                'handle': this
            });
        }
        else if(!draggable && this._draggable){
            this._draggable.destroy();
            delete this._draggable;
        }

        return this._draggable;

    };

    /**
     * Set/Unset the resizable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [resizable=true] Whether to activate or deactivate the resizable
     * @return {Resizable} The resizable behaviour
     */
    Element.prototype.setResizable = function(resizable){

        resizable = resizable !== false;

        if(this.getProperty('locked') && resizable){
            return false;
        }

        if(resizable && !this._resizable){
            this._resizable = new metaScore.Resizable({
                'target': this
            });
        }
        else if(!resizable && this._resizable){
            this._resizable.destroy();
            delete this._resizable;
        }

        return this._resizable;

    };

    return Element;

})();
/**
 * @module Player
 */

metaScore.namespace('player.component').Media = (function () {

    /**
     * Fired when the media source is set
     *
     * @event sourcesset
     * @param {Object} media The media instance
     */
    var EVT_SOURCESSET = 'sourcesset';

    /**
     * Fired when the metadata has loaded
     *
     * @event loadedmetadata
     * @param {Object} media The media instance
     */
    var EVT_LOADEDMETADATA = 'loadedmetadata';

    /**
     * Fired when the media starts playing
     *
     * @event play
     * @param {Object} media The media instance
     */
    var EVT_PLAY = 'play';

    /**
     * Fired when the media is paused
     *
     * @event pause
     * @param {Object} media The media instance
     */
    var EVT_PAUSE = 'pause';

    /**
     * Fired when a seek operation begins
     *
     * @event seeking
     * @param {Object} media The media instance
     */
    var EVT_SEEKING = 'seeking';

    /**
     * Fired when a seek operation completes
     *
     * @event seeked
     * @param {Object} media The media instance
     */
    var EVT_SEEKED = 'seeked';

    /**
     * Fired when the media's time changed
     *
     * @event timeupdate
     * @param {Object} media The media instance
     */
    var EVT_TIMEUPDATE = 'timeupdate';

    /**
     * A media component
     *
     * @class Controller
     * @namespace player.component
     * @extends player.Component
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    function Media(configs){
        // call parent constructor
        Media.parent.call(this, configs);

        this.addClass('media').addClass(this.configs.type);

        this.el = new metaScore.Dom('<'+ this.configs.type +'></'+ this.configs.type +'>', {'preload': 'auto'})
            .addListener('loadedmetadata', metaScore.Function.proxy(this.onLoadedMetadata, this))
            .addListener('play', metaScore.Function.proxy(this.onPlay, this))
            .addListener('pause', metaScore.Function.proxy(this.onPause, this))
            .addListener('timeupdate', metaScore.Function.proxy(this.onTimeUpdate, this))
            .addListener('seeking', metaScore.Function.proxy(this.onSeeking, this))
            .addListener('seeked', metaScore.Function.proxy(this.onSeeked, this))
            .appendTo(this);

        this.dom = this.el.get(0);

        this.playing = false;
    }

    metaScore.player.Component.extend(Media);

    Media.defaults = {
        'type': 'audio',
        'useFrameAnimation': true,
        'properties': {
            'locked': {
                'type': 'Boolean',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Media.locked', 'Locked ?')
                },
                'getter': function(skipDefault){
                    return this.data('locked') === "true";
                },
                'setter': function(value){
                    this.data('locked', value ? "true" : null);
                }
            },
            'x': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Media.x', 'X'),
                    'spinDirection': 'vertical'
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('left'), 10);
                },
                'setter': function(value){
                    this.css('left', value +'px');
                }
            },
            'y': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Media.y', 'Y'),
                    'flipSpinButtons': true
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('top'), 10);
                },
                'setter': function(value){
                    this.css('top', value +'px');
                },
            },
            'width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Media.width', 'Width'),
                    'spinDirection': 'vertical'
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('width'), 10);
                },
                'setter': function(value){
                    this.css('width', value +'px');
                }
            },
            'height': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Media.height', 'Height'),
                    'flipSpinButtons': true
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('height'), 10);
                },
                'setter': function(value){
                    this.css('height', value +'px');
                }
            },
            'z-index': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.z-index', 'Display index')
                },
                'getter': function(skipDefault){
                    var value = parseInt(this.css('z-index', undefined, skipDefault), 10);
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.css('z-index', value);
                }
            },
            'background-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.background-color', 'Background color')
                },
                'getter': function(skipDefault){
                    return this.css('background-color', undefined, skipDefault);
                },
                'setter': function(value){
                    var color = metaScore.Color.parse(value);
                    this.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
                }
            },
            'border-width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.border-width', 'Border width'),
                    'min': 0
                },
                'getter': function(skipDefault){
                    var value = parseInt(this.css('border-width', undefined, skipDefault), 10);
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.css('border-width', value +'px');
                }
            },
            'border-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.border-color', 'Border color')
                },
                'getter': function(skipDefault){
                    return this.css('border-color', undefined, skipDefault);
                },
                'setter': function(value){
                    var color = metaScore.Color.parse(value);
                    this.css('border-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
                }
            },
            'border-radius': {
                'type': 'BorderRadius',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Media.border-radius', 'Border radius')
                },
                'getter': function(skipDefault){
                    return this.css('border-radius', undefined, skipDefault);
                },
                'setter': function(value){
                    this.css('border-radius', value);
                }
            }
        }
    };

    /**
     * Set the media sources
     *
     * @method setSources
     * @param {Array} sources The list of sources as objects with 'url' and 'mime' keys
     * @param {Boolean} [supressEvent=false] Whether to supress the sourcesset event
     * @chainable
     */
    Media.prototype.setSources = function(sources, supressEvent){
        var source_tags = '';

        metaScore.Array.each(sources, function(index, source) {
            source_tags += '<source src="'+ source.url +'" type="'+ source.mime +'"></source>';
        }, this);

        this.el.text(source_tags);

        this.dom.load();

        if(supressEvent !== true){
            this.triggerEvent(EVT_SOURCESSET, {'media': this});
        }

        return this;

    };

    /**
     * Get the value of the media's name property
     * 
     * @method getName
     * @return {String} The name
     */
    Media.prototype.getName = function(){
        return '[media]';
    };

    /**
     * The loadedmetadata event handler
     *
     * @method onLoadedMetadata
     * @private
     * @param {Event} evt The event object
     */
    Media.prototype.onLoadedMetadata = function(evt) {
        this.triggerEvent(EVT_LOADEDMETADATA, {'media': this});
    };

    /**
     * The play event handler
     *
     * @method onPlay
     * @private
     * @param {Event} evt The event object
     */
    Media.prototype.onPlay = function(evt) {
        this.playing = true;

        this.triggerEvent(EVT_PLAY, {'media': this});

        if(this.configs.useFrameAnimation){
            this.triggerTimeUpdate();
        }
    };

    /**
     * The pause event handler
     *
     * @method onPause
     * @private
     * @param {Event} evt The event object
     */
    Media.prototype.onPause = function(evt) {
        this.playing = false;

        this.triggerEvent(EVT_PAUSE, {'media': this});
    };

    /**
     * The timeupdate event handler
     *
     * @method onTimeUpdate
     * @private
     * @param {Event} evt The event object
     */
    Media.prototype.onTimeUpdate = function(evt){
        if(!this.configs.useFrameAnimation){
            this.triggerTimeUpdate(false);
        }
    };

    /**
     * The seeking event handler
     *
     * @method onSeeking
     * @private
     * @param {Event} evt The event object
     */
    Media.prototype.onSeeking = function(evt){
        this.triggerEvent(EVT_SEEKING, {'media': this});
    };

    /**
     * The seeked event handler
     *
     * @method onSeeked
     * @private
     * @param {Event} evt The event object
     */
    Media.prototype.onSeeked = function(evt){
        this.triggerEvent(EVT_SEEKED, {'media': this});
    };

    /**
     * Check whether the media is playing
     *
     * @method isPlaying
     * @return {Boolean} Whether the media is playing
     */
    Media.prototype.isPlaying = function() {
        return this.playing;
    };

    /**
     * Reset the media time
     *
     * @method reset
     * @chainable
     */
    Media.prototype.reset = function() {
        this.setTime(0);

        return this;
    };

    /**
     * Play the media
     *
     * @method play
     * @chainable
     */
    Media.prototype.play = function() {
        this.dom.play();

        return this;
    };

    /**
     * Pause the media
     *
     * @method pause
     * @chainable
     */
    Media.prototype.pause = function() {
        this.dom.pause();

        return this;
    };

    /**
     * Trigger the timeupdate event
     *
     * @method triggerTimeUpdate
     * @private
     * @param {Boolean} [loop=true] Whether to use requestAnimationFrame to trigger this method again
     * @chainable
     */
    Media.prototype.triggerTimeUpdate = function(loop) {
        if(loop !== false && this.isPlaying()){
            window.requestAnimationFrame(metaScore.Function.proxy(this.triggerTimeUpdate, this));
        }

        this.triggerEvent(EVT_TIMEUPDATE, {'media': this});
        
        return this;
    };

    /**
     * Set the media time
     *
     * @method setTime
     * @param {Number} time The time in centiseconds
     * @chainable
     */
    Media.prototype.setTime = function(time) {
        this.dom.currentTime = parseFloat(time) / 100;

        this.triggerTimeUpdate(false);

        return this;
    };

    /**
     * Get the current media time
     *
     * @method getTime
     * @return {Number} The time in centiseconds
     */
    Media.prototype.getTime = function() {
        return parseFloat(this.dom.currentTime) * 100;
    };

    /**
     * Get the media's duration
     *
     * @method getDuration
     * @return {Number} The duration in centiseconds
     */
    Media.prototype.getDuration = function() {
        return parseFloat(this.dom.duration) * 100;
    };

    /**
     * Set/Unset the draggable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [draggable=true] Whether to activate or deactivate the draggable
     * @return {Draggable} The draggable behaviour
     */
    Media.prototype.setDraggable = function(draggable){

        draggable = draggable !== false;

        if(this.getProperty('locked') && draggable){
            return false;
        }

        if(draggable && !this._draggable){
            this._draggable = new metaScore.Draggable({
                'target': this,
                'handle': this.child('video'),
                'limits': {
                    'top': 0,
                    'left': 0
                }
            });
        }
        else if(!draggable && this._draggable){
            this._draggable.destroy();
            delete this._draggable;
        }

        return this._draggable;

    };

    /**
     * Set/Unset the resizable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [resizable=true] Whether to activate or deactivate the resizable
     * @return {Resizable} The resizable behaviour
     */
    Media.prototype.setResizable = function(resizable){

        resizable = resizable !== false;

        if(this.getProperty('locked') && resizable){
            return false;
        }

        if(resizable && !this._resizable){
            this._resizable = new metaScore.Resizable({
                'target': this
            });
        }
        else if(!resizable && this._resizable){
            this._resizable.destroy();
            delete this._resizable;
        }

        return this._resizable;

    };

    return Media;

})();
/**
 * @module Player
 */

metaScore.namespace('player.component').Page = (function () {

    /**
     * Fired when an element is added
     *
     * @event elementadd
     * @param {Object} page The page instance
     * @param {Object} element The element instance
     */
    var EVT_ELEMENTADD = 'elementadd';

    /**
     * Fired when a cuepoint started
     *
     * @event cuepointstart
     */
    var EVT_CUEPOINTSTART = 'cuepointstart';

    /**
     * Fired when a cuepoint stops
     *
     * @event cuepointstop
     */
    var EVT_CUEPOINTSTOP = 'cuepointstop';

    /**
     * A page component
     *
     * @class Controller
     * @namespace player.component
     * @extends player.Component
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    function Page(configs) {
        // call parent constructor
        Page.parent.call(this, configs);
    }

    metaScore.player.Component.extend(Page);

    Page.defaults = {
        'properties': {
            'background-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Page.background-color', 'Background color')
                },
                'getter': function(skipDefault){
                    return this.css('background-color', undefined, skipDefault);
                },
                'setter': function(value){
                    var color = metaScore.Color.parse(value);
                    this.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
                }
            },
            'background-image': {
                'type': 'Image',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Page.background-image', 'Background image')
                },
                'getter': function(skipDefault){
                    var value = this.css('background-image', undefined, skipDefault);

                    if(value === 'none' || !metaScore.Var.is(value, "string")){
                        return null;
                    }

                    return value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                },
                'setter': function(value){
                    value = (value !== 'none' && metaScore.Var.is(value, "string") && (value.length > 0)) ? 'url('+ value +')' : null;
                    this.css('background-image', value);
                }
            },
            'start-time': {
                'type': 'Time',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Page.start-time', 'Start time'),
                    'checkbox': false,
                    'inButton': true,
                    'outButton': true
                },
                'getter': function(skipDefault){
                    var value = parseFloat(this.data('start-time'));
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.data('start-time', isNaN(value) ? null : value);
                }
            },
            'end-time': {
                'type': 'Time',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Page.end-time', 'End time'),
                    'checkbox': false,
                    'inButton': true,
                    'outButton': true
                },
                'getter': function(skipDefault){
                    var value = parseFloat(this.data('end-time'));
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.data('end-time', isNaN(value) ? null : value);
                }
            },
            'elements': {
                'editable': false,
                'getter': function(skipDefault){
                    var elements = [];

                    metaScore.Array.each(this.getElements(), function(index, element){
                        elements.push(element.getProperties(skipDefault));
                    }, this);

                    return elements;
                },
                'setter': function(value){
                    metaScore.Array.each(value, function(index, configs){
                        this.addElement(configs);
                    }, this);
                }
            }
        }
    };

    /**
     * Setup the page's UI
     * 
     * @method setupUI
     * @private
     */
    Page.prototype.setupUI = function(){
        // call parent function
        Page.parent.prototype.setupUI.call(this);

        this.addClass('page');
    };

    /**
     * Add an new element component to this page
     * 
     * @method addElement
     * @param {Object} configs Configs to use for the element (see {{#crossLink "player.component.Element}"}}{{/crossLink}})
     * @return {player.component.Element} The element
     */
    Page.prototype.addElement = function(configs, supressEvent){
        var element;

        if(configs instanceof metaScore.player.component.Element){
            element = configs;
            element.appendTo(this);
        }
        else{
            element = new metaScore.player.component.element[configs.type](metaScore.Object.extend({}, configs, {
                'container': this
            }));
        }

        if(supressEvent !== true){
            this.triggerEvent(EVT_ELEMENTADD, {'page': this, 'element': element});
        }

        return element;
    };

    /**
     * Get the block component this page belongs to
     * 
     * @method getBlock
     * @return {player.component.Block}
     */
    Page.prototype.getBlock = function(){
        var dom = this.parents().parents().get(0),
            block;

        if(dom){
            block = dom._metaScore;
        }

        return block;
    };

    /**
     * Get the element components that belong to this page
     * 
     * @method getElements
     * @return {Array} The list of elements
     */
    Page.prototype.getElements = function(){
        var elements = [];

        this.children('.element').each(function(index, dom){
            elements.push(dom._metaScore);
        });

        return elements;
    };

    /**
     * The cuepoint start event handler
     * 
     * @method onCuePointStart
     * @private
     * @param {Event} evt The event object
     */
    Page.prototype.onCuePointStart = function(evt){
        this.triggerEvent(EVT_CUEPOINTSTART);
    };

    /**
     * The cuepoint stop event handler
     * 
     * @method onCuePointStop
     * @private
     * @param {Event} evt The event object
     */
    Page.prototype.onCuePointStop = function(evt){
        this.triggerEvent(EVT_CUEPOINTSTOP);
    };

    return Page;

})();
/**
 * @module Player
 */

metaScore.namespace('player.component.element').Cursor = (function () {

    /**
     * Fired when a cursor is clicked, requesting a time update
     *
     * @event time
     * @param {Object} element The element instance
     * @param {Number} time The time value according to the click position
     */
    var EVT_TIME = 'time';

    /**
     * A cursor element
     *
     * @class Cursor
     * @namespace player.component.element
     * @extends player.component.Element
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    function Cursor(configs) {
        // call parent constructor
        Cursor.parent.call(this, configs);
    }

    metaScore.player.component.Element.extend(Cursor);

    Cursor.defaults = {
        'properties': metaScore.Object.extend({}, metaScore.player.component.Element.defaults.properties, {
            'direction': {
                'type': 'Select',
                'configs': {
                    'label': metaScore.Locale.t('player.component.element.Cursor.direction', 'Direction'),
                    'options': {
                        'right': metaScore.Locale.t('player.component.element.Cursor.direction.right', 'Left > Right'),
                        'left': metaScore.Locale.t('player.component.element.Cursor.direction.left', 'Right > Left'),
                        'bottom': metaScore.Locale.t('player.component.element.Cursor.direction.bottom', 'Top > Bottom'),
                        'top': metaScore.Locale.t('player.component.element.Cursor.direction.top', 'Bottom > Top'),
                    }
                },
                'getter': function(skipDefault){
                    return this.data('direction');
                },
                'setter': function(value){
                    this.data('direction', value);
                }
            },
            'acceleration': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.element.Cursor.acceleration', 'Acceleration')
                },
                'getter': function(skipDefault){
                    return this.data('accel');
                },
                'setter': function(value){
                    this.data('accel', value);
                }
            },
            'cursor-width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.element.Cursor.cursor-width', 'Cursor width')
                },
                'getter': function(skipDefault){
                    var value = parseInt(this.cursor.css('width', undefined, skipDefault), 10);
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.cursor.css('width', value +'px');
                }
            },
            'cursor-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.element.Cursor.cursor-color', 'Cursor color')
                },
                'getter': function(skipDefault){
                     return this.cursor.css('background-color', undefined, skipDefault);
                },
                'setter': function(value){
                    var color = metaScore.Color.parse(value);
                    this.cursor.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
                }
            }
        })
    };

    /**
     * Setup the cursor's UI
     * 
     * @method setupUI
     * @private
     */
    Cursor.prototype.setupUI = function(){
        // call parent function
        Cursor.parent.prototype.setupUI.call(this);

        this.data('type', 'Cursor');

        this.cursor = new metaScore.Dom('<div/>', {'class': 'cursor'})
            .appendTo(this.contents);

        this.addListener('click', metaScore.Function.proxy(this.onClick, this));
    };

    /**
     * The click event handler
     *
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    Cursor.prototype.onClick = function(evt){
        var pos, time,
            inTime, outTime,
            direction, acceleration,
            rect;

        inTime = this.getProperty('start-time');
        outTime = this.getProperty('end-time');
        direction = this.getProperty('direction');
        acceleration = this.getProperty('acceleration');
        rect = evt.target.getBoundingClientRect();

        switch(direction){
            case 'left':
                pos = (rect.right - evt.clientX) / this.getProperty('width');
                break;

            case 'bottom':
                pos = (evt.clientY - rect.top) / this.getProperty('height');
                break;

            case 'top':
                pos = (rect.bottom - evt.clientY) / this.getProperty('height');
                break;

            default:
                pos = (evt.clientX - rect.left) / this.getProperty('width');
        }

        if(!acceleration || acceleration === 1){
            time = inTime + ((outTime - inTime) * pos);
        }
        else{
            time = inTime + ((outTime - inTime) * Math.pow(pos, 1/acceleration));
        }

        this.triggerEvent(EVT_TIME, {'element': this, 'value': time});
    };

    /**
     * The cuepoint update event handler
     *
     * @method onCuePointUpdate
     * @private
     * @param {Event} evt The event object
     */
    Cursor.prototype.onCuePointUpdate = function(evt){
        var width, height,
            curTime, inTime, outTime, pos,
            direction = this.getProperty('direction'),
            acceleration = this.getProperty('acceleration');

        curTime = evt.target.getMedia().getTime();
        inTime = this.getProperty('start-time');
        outTime = this.getProperty('end-time');

        if(!acceleration || acceleration === 1){
            pos = (curTime - inTime)    / (outTime - inTime);
        }
        else{
            pos = Math.pow((curTime - inTime) / (outTime - inTime), acceleration);
        }

        switch(direction){
            case 'left':
                width = this.getProperty('width');
                pos = Math.min(width * pos, width);
                this.cursor.css('right', pos +'px');
                break;

            case 'bottom':
                height = this.getProperty('height');
                pos = Math.min(height * pos, height);
                this.cursor.css('top', pos +'px');
                break;

            case 'top':
                height = this.getProperty('height');
                pos = Math.min(height * pos, height);
                this.cursor.css('bottom', pos +'px');
                break;

            default:
                width = this.getProperty('width');
                pos = Math.min(width * pos, width);
                this.cursor.css('left', pos +'px');
        }
    };

    return Cursor;

})();
/**
 * @module Player
 */

metaScore.namespace('player.component.element').Image = (function () {

    /**
     * An image element
     *
     * @class Cursor
     * @namespace player.component.element
     * @extends player.component.Element
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    function Image(configs) {
        // call parent constructor
        Image.parent.call(this, configs);
    }

    metaScore.player.component.Element.extend(Image);

    /**
     * Setup the image's UI
     * 
     * @method setupUI
     * @private
     */
    Image.prototype.setupUI = function(){
        // call parent function
        Image.parent.prototype.setupUI.call(this);

        this.data('type', 'Image');
    };

    return Image;

})();
/**
 * @module Player
 */

metaScore.namespace('player.component.element').Text = (function () {

    /**
     * Fired when a page link is clicked
     *
     * @event page
     * @param {Object} element The element instance
     * @param {Object} block The block instance
     * @param {Integer} index The page index
     */
    var EVT_PAGE = 'page';

    /**
     * Fired when a play link is clicked
     *
     * @event play
     * @param {Object} element The element instance
     * @param {Number} inTime The start time
     * @param {Number} outTime The end time
     * @param {Integer} rIndex The reading index
     */
    var EVT_PLAY = 'play';

    /**
     * A text element
     *
     * @class Cursor
     * @namespace player.component.element
     * @extends player.component.Element
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    function Text(configs) {
        // call parent constructor
        Text.parent.call(this, configs);

        this.addDelegate('a', 'click', metaScore.Function.proxy(this.onLinkClick, this));
    }

    metaScore.player.component.Element.extend(Text);

    Text.defaults = {
        'properties': metaScore.Object.extend({}, metaScore.player.component.Element.defaults.properties, {
            'text': {
                'editable':false,
                'getter': function(){
                    return this.contents.text();
                },
                'setter': function(value){
                    this.contents.text(value);
                }
            }
        })
    };

    /**
     * Setup the text's UI
     * 
     * @method setupUI
     * @private
     */
    Text.prototype.setupUI = function(){
        // call parent function
        Text.parent.prototype.setupUI.call(this);

        this.data('type', 'Text');
    };

    /**
     * The link click event handler
     *
     * @method onLinkClick
     * @private
     * @param {Event} evt The event object
     */
    Text.prototype.onLinkClick = function(evt){
        var link = evt.target,
            matches;

        if(!metaScore.Dom.is(link, 'a')){
            link = metaScore.Dom.closest(link, 'a');
        }

        if(link){
            if(matches = link.hash.match(/^#page=([^,]*),(\d+)$/)){
                this.triggerEvent(EVT_PAGE, {'element': this, 'block': matches[1], 'index': parseInt(matches[2])-1});
                evt.preventDefault();
            }
            else if(matches = link.hash.match(/^#play=(\d*\.?\d+),(\d*\.?\d+),(\d+)$/)){
                this.triggerEvent(EVT_PLAY, {'element': this, 'inTime': parseFloat(matches[1]), 'outTime': parseFloat(matches[2]) - 1, 'rIndex': parseInt(matches[3])});
            }
            else{
                window.open(link.href,'_blank');
            }

            evt.preventDefault();
        }

    };

    return Text;

})();
    // attach the metaScore object to the global scope
    global.metaScore = metaScore;

} (this));