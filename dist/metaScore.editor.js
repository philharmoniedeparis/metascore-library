/*! metaScore - v0.9.1 - 2018-05-28 - Oussama Mubarak */
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
        return "69ee0f";
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
        
        value = style.getPropertyValue(name);

        return value !== "" ? value : null;
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
     * @param {Object} [options.data] Data to be send along with the request
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
                'data': null,
                'dataType': 'json', // xml, json, script, text or html
                'complete': null,
                'success': null,
                'error': null,
                'scope': this
            },
            params;

        options = metaScore.Object.extend({}, defaults, options);
        
        if(options.method === 'GET' && options.data){
            params = [];
            
            metaScore.Object.each(options.data, function(key, value){
                params.push(key +'='+ encodeURIComponent(value));
            });
            
            url += '?'+ params.join('&');
            
            options.data = null;
        }

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
    
    // http://www.w3.org/TR/css3-color/
    var COLOR_NAMES = {
        "transparent": [0,0,0,0],
        "aliceblue": [240,248,255,1],
        "antiquewhite": [250,235,215,1],
        "aqua": [0,255,255,1],
        "aquamarine": [127,255,212,1],
        "azure": [240,255,255,1],
        "beige": [245,245,220,1],
        "bisque": [255,228,196,1],
        "black": [0,0,0,1],
        "blanchedalmond": [255,235,205,1],
        "blue": [0,0,255,1],
        "blueviolet": [138,43,226,1],
        "brown": [165,42,42,1],
        "burlywood": [222,184,135,1],
        "cadetblue": [95,158,160,1],
        "chartreuse": [127,255,0,1],
        "chocolate": [210,105,30,1],
        "coral": [255,127,80,1],
        "cornflowerblue": [100,149,237,1],
        "cornsilk": [255,248,220,1],
        "crimson": [220,20,60,1],
        "cyan": [0,255,255,1],
        "darkblue": [0,0,139,1],
        "darkcyan": [0,139,139,1],
        "darkgoldenrod": [184,134,11,1],
        "darkgray": [169,169,169,1],
        "darkgreen": [0,100,0,1],
        "darkgrey": [169,169,169,1],
        "darkkhaki": [189,183,107,1],
        "darkmagenta": [139,0,139,1],
        "darkolivegreen": [85,107,47,1],
        "darkorange": [255,140,0,1],
        "darkorchid": [153,50,204,1],
        "darkred": [139,0,0,1],
        "darksalmon": [233,150,122,1],
        "darkseagreen": [143,188,143,1],
        "darkslateblue": [72,61,139,1],
        "darkslategray": [47,79,79,1],
        "darkslategrey": [47,79,79,1],
        "darkturquoise": [0,206,209,1],
        "darkviolet": [148,0,211,1],
        "deeppink": [255,20,147,1],
        "deepskyblue": [0,191,255,1],
        "dimgray": [105,105,105,1],
        "dimgrey": [105,105,105,1],
        "dodgerblue": [30,144,255,1],
        "firebrick": [178,34,34,1],
        "floralwhite": [255,250,240,1],
        "forestgreen": [34,139,34,1],
        "fuchsia": [255,0,255,1],
        "gainsboro": [220,220,220,1],
        "ghostwhite": [248,248,255,1],
        "gold": [255,215,0,1],
        "goldenrod": [218,165,32,1],
        "gray": [128,128,128,1],
        "green": [0,128,0,1],
        "greenyellow": [173,255,47,1],
        "grey": [128,128,128,1],
        "honeydew": [240,255,240,1],
        "hotpink": [255,105,180,1],
        "indianred": [205,92,92,1],
        "indigo": [75,0,130,1],
        "ivory": [255,255,240,1],
        "khaki": [240,230,140,1],
        "lavender": [230,230,250,1],
        "lavenderblush": [255,240,245,1],
        "lawngreen": [124,252,0,1],
        "lemonchiffon": [255,250,205,1],
        "lightblue": [173,216,230,1],
        "lightcoral": [240,128,128,1],
        "lightcyan": [224,255,255,1],
        "lightgoldenrodyellow": [250,250,210,1],
        "lightgray": [211,211,211,1],
        "lightgreen": [144,238,144,1],
        "lightgrey": [211,211,211,1],
        "lightpink": [255,182,193,1],
        "lightsalmon": [255,160,122,1],
        "lightseagreen": [32,178,170,1],
        "lightskyblue": [135,206,250,1],
        "lightslategray": [119,136,153,1],
        "lightslategrey": [119,136,153,1],
        "lightsteelblue": [176,196,222,1],
        "lightyellow": [255,255,224,1],
        "lime": [0,255,0,1],
        "limegreen": [50,205,50,1],
        "linen": [250,240,230,1],
        "magenta": [255,0,255,1],
        "maroon": [128,0,0,1],
        "mediumaquamarine": [102,205,170,1],
        "mediumblue": [0,0,205,1],
        "mediumorchid": [186,85,211,1],
        "mediumpurple": [147,112,219,1],
        "mediumseagreen": [60,179,113,1],
        "mediumslateblue": [123,104,238,1],
        "mediumspringgreen": [0,250,154,1],
        "mediumturquoise": [72,209,204,1],
        "mediumvioletred": [199,21,133,1],
        "midnightblue": [25,25,112,1],
        "mintcream": [245,255,250,1],
        "mistyrose": [255,228,225,1],
        "moccasin": [255,228,181,1],
        "navajowhite": [255,222,173,1],
        "navy": [0,0,128,1],
        "oldlace": [253,245,230,1],
        "olive": [128,128,0,1],
        "olivedrab": [107,142,35,1],
        "orange": [255,165,0,1],
        "orangered": [255,69,0,1],
        "orchid": [218,112,214,1],
        "palegoldenrod": [238,232,170,1],
        "palegreen": [152,251,152,1],
        "paleturquoise": [175,238,238,1],
        "palevioletred": [219,112,147,1],
        "papayawhip": [255,239,213,1],
        "peachpuff": [255,218,185,1],
        "peru": [205,133,63,1],
        "pink": [255,192,203,1],
        "plum": [221,160,221,1],
        "powderblue": [176,224,230,1],
        "purple": [128,0,128,1],
        "rebeccapurple": [102,51,153,1],
        "red": [255,0,0,1],
        "rosybrown": [188,143,143,1],
        "royalblue": [65,105,225,1],
        "saddlebrown": [139,69,19,1],
        "salmon": [250,128,114,1],
        "sandybrown": [244,164,96,1],
        "seagreen": [46,139,87,1],
        "seashell": [255,245,238,1],
        "sienna": [160,82,45,1],
        "silver": [192,192,192,1],
        "skyblue": [135,206,235,1],
        "slateblue": [106,90,205,1],
        "slategray": [112,128,144,1],
        "slategrey": [112,128,144,1],
        "snow": [255,250,250,1],
        "springgreen": [0,255,127,1],
        "steelblue": [70,130,180,1],
        "tan": [210,180,140,1],
        "teal": [0,128,128,1],
        "thistle": [216,191,216,1],
        "tomato": [255,99,71,1],
        "turquoise": [64,224,208,1],
        "violet": [238,130,238,1],
        "wheat": [245,222,179,1],
        "white": [255,255,255,1],
        "whitesmoke": [245,245,245,1],
        "yellow": [255,255,0,1],
        "yellowgreen": [154,205,50,1]
    };

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
        var matches;

        if(metaScore.Var.is(color, 'object')){
            return {
                "r": 'r' in color ? color.r : 0,
                "g": 'g' in color ? color.g : 0,
                "b": 'b' in color ? color.b : 0,
                "a": 'a' in color ? color.a : 1
            };
        }
        
        if(metaScore.Var.is(color, 'string')){            
            if(color in COLOR_NAMES){
                return {
                    "r": COLOR_NAMES[color][0],
                    "g": COLOR_NAMES[color][1],
                    "b": COLOR_NAMES[color][2],
                    "a": COLOR_NAMES[color][3]
                };
            }
            
            color = color.replace(/\s\s*/g,''); // Remove all spaces

            // Checks for 6 digit hex and converts string to integer
            if(matches = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color)){
                return {
                    "r": parseInt(matches[1], 16),
                    "g": parseInt(matches[2], 16),
                    "b": parseInt(matches[3], 16),
                    "a": 1
                };
            }

            // Checks for 3 digit hex and converts string to integer
            if(matches = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(color)){
                return {
                    "r": parseInt(matches[1], 16) * 17,
                    "g": parseInt(matches[2], 16) * 17,
                    "b": parseInt(matches[3], 16) * 17,
                    "a": 1
                };
            }

            // Checks for rgba and converts string to
            // integer/float using unary + operator to save bytes
            if(matches = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(color)){
                return {
                    "r": +matches[1],
                    "g": +matches[2],
                    "b": +matches[3],
                    "a": +matches[4]
                };
            }

            // Checks for rgb and converts string to
            // integer/float using unary + operator to save bytes
            if(matches = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color)){
                return {
                    "r": +matches[1],
                    "g": +matches[2],
                    "b": +matches[3],
                    "a": 1
                };
            }
        }

        return null;
    };
    
    Color.toCSS = function(color){
        
        var rgba = Color.parse(color);
        
        return rgba ? 'rgba('+ rgba.r +','+ rgba.g +','+ rgba.b +','+ rgba.a +')' : null;
        
    };

    return Color;

})();
/**
 * @module Core
 */

metaScore.ContextMenu = (function(){

    /**
     * Fired before the menu is shows
     *
     * @event beforeshow
     * @param {Object} original_event The original contextmenu event
     */
    var EVT_BEFORESHOW = 'beforeshow';

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
        
        if(this.triggerEvent(EVT_BEFORESHOW, {'original_event': evt}) === false){
            return;
        }
        
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
     * Fired before the dragging starts
     * The dragging can be canceled by invoking preventDefault on the event
     *
     * @event beforedrag
     */
    var EVT_BEFOREDRAG = 'beforedrag';

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
        
        if(!this.configs.target.triggerEvent(EVT_BEFOREDRAG, null, true, true)){
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
    /**
    * Returns a throttled version of a function
    * The returned function will only call the original function at most once per the specified threshhold
    * @method throttle
    * @param {Function} fn The function to throttle
    * @param {Number} threshhold The threshhold in milliseconds
    * @param {Object} scope The scope in which the original function will be called
    * @return {Function} The throttled function
    */
    Function.throttle = function(fn, threshhold, scope){
        var lastFn, lastRan;

        return function() {
          var args = arguments;

          if (!lastRan) {
            fn.apply(scope, args);
            lastRan = Date.now();
          }
          else {
            clearTimeout(lastFn);

            lastFn = setTimeout(function(){
              if((Date.now() - lastRan) >= threshhold){
                fn.apply(scope, args);
                lastRan = Date.now();
              }
            }, threshhold - (Date.now() - lastRan));
          }
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
            str = metaScore.String.replaceAll(str, key, args[key]);
        }, this);

        return str;
    };

    return Locale;

})();
/**
 * @module Core
 */

metaScore.Number = (function () {

    /**
     * A class for number helper functions
     * 
     * @class Number
     * @constructor
     */
    function Number() {
    }

    /**
     * Get the number of decimal places
     * 
     * @method getDecimalPlaces
     * @param {Number} value The number to check against
     * @return {Number} The number of decimal places
     */
    Number.getDecimalPlaces = function(value){
        var match = (''+value).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        
        if (!match) {
            return 0;
        }
        
        return Math.max(
            0,
           (match[1] ? match[1].length : 0) // Number of digits right of decimal point
           -(match[2] ? +match[2] : 0) // Adjust for scientific notation
       );
    };

    return Number;

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

        this.toggleClass('modal', this.configs.modal);
        
        this.inner = new metaScore.Dom('<div/>', {'class': 'inner'})
            .appendTo(this);

        if(this.configs.toolbar){
            this.toolbar = new metaScore.overlay.Toolbar({'title': this.configs.title})
                .appendTo(this.inner);

            this.toolbar.addButton('close')
                .addListener('click', metaScore.Function.proxy(this.onCloseClick, this));
        }

        this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
            .appendTo(this.inner);

    };

    /**
     * Show the overlay
     *
     * @method show
     * @chainable
     */
    Overlay.prototype.show = function(){
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

    /**
     * Replace all occurences of a sub-string in a string
     * 
     * @method replaceAll
     * @param {String} str The string being searched and replaced on
     * @param {String} search The value being searched for
     * @param {String} replacement The value that replaces found search values
     * @return {String} The replaced string
     *
     * @exqmple
     *    var str = "abc test test abc test test test abc test test abc";
     *    var replaced = metaScore.String.replaceAll(str, "abc", "xyz");
     *    // "xyz test test xyz test test test xyz test test xyz"
     */
    String.replaceAll = function(str, search, replacement) {
        var escaped_search = search.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        var regex = new RegExp(escaped_search, 'g');
        
        return str.replace(regex, replacement);
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
 * The Editor module defines classes used in editor
 *
 * @module Editor
 * @main
 */
 
metaScore.Editor = (function(){

    /**
     * Provides the main Editor class
     *
     * @class Editor
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Mixed} [configs.container='body'] The HTMLElement, Dom instance, or CSS selector to which the editor should be appended
     * @param {String} [configs.player_url=''] The base URL of players
     * @param {String} [configs.api_url=''] The base URL of the RESTful API
     * @param {String} [configs.help_url=''] The base URL of the RESTful API
     * @param {String} [configs.player_api_help_url=''] The URL of the player API help page
     * @param {String} [configs.account_url=''] The URL of the user account page
     * @param {String} [configs.logout_url=''] The URL of the user logout page
     * @param {Object} [configs.user_groups={}] The groups the user belongs to
     * @param {Boolean} [configs.reload_player_on_save=false] Whether to reload the player each time the guide is saved or not
     * @param {Object} [configs.ajax={}] Custom options to send with each AJAX request. See {{#crossLink "Ajax/send:method"}}Ajax.send{{/crossLink}} for available options
     */
    function Editor(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Editor.parent.call(this, '<div/>', {'class': 'metaScore-editor'});

        if(this.configs.container){
            this.appendTo(this.configs.container);
        }

        // add components

        this.h_ruler = new metaScore.Dom('<div/>', {'class': 'ruler horizontal'}).appendTo(this);
        this.v_ruler = new metaScore.Dom('<div/>', {'class': 'ruler vertical'}).appendTo(this);

        this.workspace = new metaScore.Dom('<div/>', {'class': 'workspace'}).appendTo(this);

        this.mainmenu = new metaScore.editor.MainMenu().appendTo(this)
            .toggleButton('help', this.configs.help_url ? true : false)
            .toggleButton('account', this.configs.account_url ? true : false)
            .toggleButton('logout', this.configs.logout_url ? true : false)
            .addDelegate('button[data-action]:not(.disabled)', 'click', metaScore.Function.proxy(this.onMainmenuClick, this))
            .addDelegate('.time', 'valuechange', metaScore.Function.proxy(this.onMainmenuTimeFieldChange, this))
            .addDelegate('.r-index', 'valuechange', metaScore.Function.proxy(this.onMainmenuRindexFieldChange, this));

        this.sidebar_wrapper = new metaScore.Dom('<div/>', {'class': 'sidebar-wrapper'}).appendTo(this)
            .addListener('resizestart', metaScore.Function.proxy(this.onSidebarResizeStart, this))
            .addListener('resize', metaScore.Function.proxy(this.onSidebarResize, this))
            .addListener('resizeend', metaScore.Function.proxy(this.onSidebarResizeEnd, this));

        this.sidebar = new metaScore.Dom('<div/>', {'class': 'sidebar'}).appendTo(this.sidebar_wrapper);

        this.sidebar_resizer = new metaScore.Resizable({target: this.sidebar_wrapper, directions: ['left']});
        this.sidebar_resizer.getHandle('left')
            .addListener('dblclick', metaScore.Function.proxy(this.onSidebarResizeDblclick, this));

        this.panels = {};

        this.panels.block = new metaScore.editor.panel.Block().appendTo(this.sidebar)
            .addListener('componentbeforeset', metaScore.Function.proxy(this.onBlockBeforeSet, this))
            .addListener('componentset', metaScore.Function.proxy(this.onBlockSet, this))
            .addListener('componentunset', metaScore.Function.proxy(this.onBlockUnset, this))
            .addListener('valueschange', metaScore.Function.proxy(this.onBlockPanelValueChange, this));

        this.panels.block.getToolbar()
            .addDelegate('.selector', 'valuechange', metaScore.Function.proxy(this.onBlockPanelSelectorChange, this))
            .addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onBlockPanelToolbarClick, this));

        this.panels.page = new metaScore.editor.panel.Page().appendTo(this.sidebar)
            .addListener('componentbeforeset', metaScore.Function.proxy(this.onPageBeforeSet, this))
            .addListener('componentset', metaScore.Function.proxy(this.onPageSet, this))
            .addListener('componentunset', metaScore.Function.proxy(this.onPageUnset, this))
            .addListener('valueschange', metaScore.Function.proxy(this.onPagePanelValueChange, this));

        this.panels.page.getToolbar()
            .addDelegate('.selector', 'valuechange', metaScore.Function.proxy(this.onPagePanelSelectorChange, this))
            .addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onPagePanelToolbarClick, this));

        this.panels.element = new metaScore.editor.panel.Element().appendTo(this.sidebar)
            .addListener('componentbeforeset', metaScore.Function.proxy(this.onElementBeforeSet, this))
            .addListener('componentset', metaScore.Function.proxy(this.onElementSet, this))
            .addListener('valueschange', metaScore.Function.proxy(this.onElementPanelValueChange, this));

        this.panels.element.getToolbar()
            .addDelegate('.selector', 'valuechange', metaScore.Function.proxy(this.onElementPanelSelectorChange, this))
            .addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onElementPanelToolbarClick, this));

        this.grid = new metaScore.Dom('<div/>', {'class': 'grid'}).appendTo(this.workspace);

        this.history = new metaScore.editor.History()
            .addListener('add', metaScore.Function.proxy(this.onHistoryAdd, this))
            .addListener('undo', metaScore.Function.proxy(this.onHistoryUndo, this))
            .addListener('redo', metaScore.Function.proxy(this.onHistoryRedo, this));
            
        this.clipboard = new metaScore.Clipboard();
        
        // prevent the custom contextmenu from overriding the native one in inputs
        this.addDelegate('input', 'contextmenu', function(evt){
            evt.stopImmediatePropagation();
            evt.stopPropagation();
        });
        
        this.contextmenu = new metaScore.ContextMenu({'target': this, 'items': {
                'about': {
                    'text': metaScore.Locale.t('editor.contextmenu.about', 'metaScore v.!version r.!revision', {'!version': metaScore.getVersion(), '!revision': metaScore.getRevision()})
                }
            }})
            .appendTo(this);
                
        this.player_contextmenu = new metaScore.ContextMenu({'target': null, 'items': {
                'add-element': {
                    'text': metaScore.Locale.t('editor.contextmenu.add-element', 'Add an element'),
                    'items': {
                        'add-element-cursor': {
                            'text': metaScore.Locale.t('editor.contextmenu.add-element-cursor', 'Cursor'),
                            'callback': metaScore.Function.proxy(function(context){
                                this.addPlayerComponent('element', {'type': 'Cursor'}, metaScore.Dom.closest(context, '.metaScore-component.page')._metaScore);
                            }, this)
                        },
                        'add-element-image': {
                            'text': metaScore.Locale.t('editor.contextmenu.add-element-image', 'Image'),
                            'callback': metaScore.Function.proxy(function(context){
                                this.addPlayerComponent('element', {'type': 'Image'}, metaScore.Dom.closest(context, '.metaScore-component.page')._metaScore);
                            }, this)
                        },
                        'add-element-text': {
                            'text': metaScore.Locale.t('editor.contextmenu.add-element-text', 'Text'),
                            'callback': metaScore.Function.proxy(function(context){
                                this.addPlayerComponent('element', {'type': 'Text'}, metaScore.Dom.closest(context, '.metaScore-component.page')._metaScore);
                            }, this)
                        }
                    },
                    'toggler': metaScore.Function.proxy(function(context){
                        return (this.editing === true) && (metaScore.Dom.closest(context, '.metaScore-component.page') ? true : false);
                    }, this)
                },
                'copy-element': {
                    'text': metaScore.Locale.t('editor.contextmenu.copy-element', 'Copy element'),
                    'callback': metaScore.Function.proxy(function(context){
                        this.clipboard.setData('element', metaScore.Dom.closest(context, '.metaScore-component.element')._metaScore.getProperties());
                    }, this),
                    'toggler': metaScore.Function.proxy(function(context){
                        return (this.editing === true) && (metaScore.Dom.closest(context, '.metaScore-component.element') ? true : false);
                    }, this)
                },
                'paste-element': {
                    'text': metaScore.Locale.t('editor.contextmenu.paste-element', 'Paste element'),
                    'callback': metaScore.Function.proxy(function(context){
                        var component = this.clipboard.getData();
                        component.x += 5;
                        component.y += 5;
                        this.addPlayerComponent('element', component, metaScore.Dom.closest(context, '.metaScore-component.page')._metaScore);
                    }, this),
                    'toggler': metaScore.Function.proxy(function(context){
                        return (this.editing === true) && (this.clipboard.getDataType() === 'element') && (metaScore.Dom.closest(context, '.metaScore-component.page') ? true : false);
                    }, this)
                },
                'delete-element': {
                    'text': metaScore.Locale.t('editor.contextmenu.delete-element', 'Delete element'),
                    'callback': metaScore.Function.proxy(function(context){
                        this.deletePlayerComponent(metaScore.Dom.closest(context, '.metaScore-component.element')._metaScore, true);
                    }, this),
                    'toggler': metaScore.Function.proxy(function(context){
                        if(this.editing !== true){
                            return false;
                        }
                        
                        var dom = metaScore.Dom.closest(context, '.metaScore-component.element');
                        return dom && !dom._metaScore.getProperty('locked');
                    }, this)
                },
                'lock-element': {
                    'text': metaScore.Locale.t('editor.contextmenu.lock-element', 'Lock element'),
                    'callback': metaScore.Function.proxy(function(context){
                        metaScore.Dom.closest(context, '.metaScore-component.element')._metaScore.setProperty('locked', true);
                    }, this),
                    'toggler': metaScore.Function.proxy(function(context){
                        if(this.editing !== true){
                            return false;
                        }
                        
                        var dom = metaScore.Dom.closest(context, '.metaScore-component.element');
                        return dom && !dom._metaScore.getProperty('locked');
                    }, this)
                },
                'unlock-element': {
                    'text': metaScore.Locale.t('editor.contextmenu.unlock-element', 'Unlock element'),
                    'callback': metaScore.Function.proxy(function(context){
                        metaScore.Dom.closest(context, '.metaScore-component.element')._metaScore.setProperty('locked', false);
                    }, this),
                    'toggler': metaScore.Function.proxy(function(context){
                        if(this.editing !== true){
                            return false;
                        }
                        
                        var dom = metaScore.Dom.closest(context, '.metaScore-component.element');
                        return dom && dom._metaScore.getProperty('locked');
                    }, this)
                },
                'element-separator': {
                    'class': 'separator',
                    'toggler': metaScore.Function.proxy(function(context){
                        return (this.editing === true) && (metaScore.Dom.closest(context, '.metaScore-component.page, .metaScore-component.element') ? true : false);
                    }, this)
                },
                'add-page': {
                    'text': metaScore.Locale.t('editor.contextmenu.add-page', 'Add a page'),
                    'callback': metaScore.Function.proxy(function(context){
                        this.addPlayerComponent('page', {}, metaScore.Dom.closest(context, '.metaScore-component.block')._metaScore);
                    }, this),
                    'toggler': metaScore.Function.proxy(function(context){
                        return (this.editing === true) && (metaScore.Dom.closest(context, '.metaScore-component.block') ? true : false);
                    }, this)
                },
                'delete-page': {
                    'text': metaScore.Locale.t('editor.contextmenu.delete-page', 'Delete page'),
                    'callback': metaScore.Function.proxy(function(context){
                        this.deletePlayerComponent(metaScore.Dom.closest(context, '.metaScore-component.page')._metaScore, true);
                    }, this),
                    'toggler': metaScore.Function.proxy(function(context){
                        return (this.editing === true) && (metaScore.Dom.closest(context, '.metaScore-component.page') ? true : false);
                    }, this)
                },
                'page-separator': {
                    'class': 'separator',
                    'toggler': metaScore.Function.proxy(function(context){
                        return (this.editing === true) && (metaScore.Dom.closest(context, '.metaScore-component.block, .metaScore-component.page') ? true : false);
                    }, this)
                },
                'add-block': {
                    'text': metaScore.Locale.t('editor.contextmenu.add-block', 'Add a block'),
                    'items': {
                        'add-block-synched': {
                            'text': metaScore.Locale.t('editor.contextmenu.add-block-synched', 'Synchronized'),
                            'callback': metaScore.Function.proxy(function(context){
                                this.addPlayerComponent('block', {'synched': true}, this.getPlayer());
                            }, this)
                        },
                        'add-block-non-synched': {
                            'text': metaScore.Locale.t('editor.contextmenu.add-block-non-synched', 'Non-synchronized'),
                            'callback': metaScore.Function.proxy(function(context){
                                this.addPlayerComponent('block', {'synched': false}, this.getPlayer());
                            }, this)
                        },
                        'add-block-toggler': {
                            'text': metaScore.Locale.t('editor.contextmenu.add-block-toggler', 'Block Toggler'),
                            'callback': metaScore.Function.proxy(function(context){
                                this.addPlayerComponent('block-toggler', {}, this.getPlayer());
                            }, this)
                        }
                    },
                    'toggler': metaScore.Function.proxy(function(context){
                        return (this.editing === true);
                    }, this)
                },
                'copy-block': {
                    'text': metaScore.Locale.t('editor.contextmenu.copy-block', 'Copy block'),
                    'callback': metaScore.Function.proxy(function(context){
                        var component = metaScore.Dom.closest(context, '.metaScore-component.block, .metaScore-component.block-toggler')._metaScore,
                            type = component.instanceOf('BlockToggler') ? 'block-toggler' : 'block';

                        this.clipboard.setData(type, component.getProperties());
                    }, this),
                    'toggler': metaScore.Function.proxy(function(context){
                        return (this.editing === true) && (metaScore.Dom.closest(context, '.metaScore-component.block, .metaScore-component.block-toggler') ? true : false);
                    }, this)
                },
                'paste-block': {
                    'text': metaScore.Locale.t('editor.contextmenu.paste-block', 'Paste block'),
                    'callback': metaScore.Function.proxy(function(context){
                        var type = this.clipboard.getDataType(),
                            component = this.clipboard.getData();

                        component.x += 5;
                        component.y += 5;

                        if(type === 'block-toggler'){
                            this.getPlayer().addBlockToggler(component);
                        }
                        else{
                            this.getPlayer().addBlock(component);
                        }
                    }, this),
                    'toggler': metaScore.Function.proxy(function(context){
                        return (this.editing === true) && (this.clipboard.getDataType() === 'block' || this.clipboard.getDataType() === 'block-toggler');
                    }, this)
                },
                'delete-block': {
                    'text': metaScore.Locale.t('editor.contextmenu.delete-block', 'Delete block'),
                    'callback': metaScore.Function.proxy(function(context){
                        this.deletePlayerComponent(metaScore.Dom.closest(context, '.metaScore-component.block, .metaScore-component.block-toggler')._metaScore, true);
                    }, this),
                    'toggler': metaScore.Function.proxy(function(context){
                        if(this.editing !== true){
                            return false;
                        }
                        
                        var dom = metaScore.Dom.closest(context, '.metaScore-component.block, .metaScore-component.block-toggler');
                        return dom && !dom._metaScore.getProperty('locked');
                    }, this)
                },
                'lock-block': {
                    'text': metaScore.Locale.t('editor.contextmenu.lock-block', 'Lock block'),
                    'callback': metaScore.Function.proxy(function(context){
                        metaScore.Dom.closest(context, '.metaScore-component.block, .metaScore-component.block-toggler')._metaScore.setProperty('locked', true);
                    }, this),
                    'toggler': metaScore.Function.proxy(function(context){
                        if(this.editing !== true){
                            return false;
                        }
                        
                        var dom = metaScore.Dom.closest(context, '.metaScore-component.block, .metaScore-component.block-toggler');
                        return dom && !dom._metaScore.getProperty('locked');
                    }, this)
                },
                'unlock-block': {
                    'text': metaScore.Locale.t('editor.contextmenu.unlock-block', 'Unlock block'),
                    'callback': metaScore.Function.proxy(function(context){
                        metaScore.Dom.closest(context, '.metaScore-component.block, .metaScore-component.block-toggler')._metaScore.setProperty('locked', false);
                    }, this),
                    'toggler': metaScore.Function.proxy(function(context){
                        if(this.editing !== true){
                            return false;
                        }
                        
                        var dom = metaScore.Dom.closest(context, '.metaScore-component.block, .metaScore-component.block-toggler');
                        return dom && dom._metaScore.getProperty('locked');
                    }, this)
                },
                'block-separator': {
                    'class': 'separator',
                    'toggler': metaScore.Function.proxy(function(context){
                        return (this.editing === true);
                    }, this)
                },
                'about': {
                    'text': metaScore.Locale.t('editor.contextmenu.about', 'metaScore v.!version r.!revision', {'!version': metaScore.getVersion(), '!revision': metaScore.getRevision()})
                }
            }})
            .appendTo(this.workspace);

        this.detailsOverlay = new metaScore.editor.overlay.GuideDetails({
                'groups': this.configs.user_groups,
                'submit_text': metaScore.Locale.t('editor.detailsOverlay.submit_text', 'Apply')
            })
            .addListener('show', metaScore.Function.proxy(this.onDetailsOverlayShow, this))
            .addListener('submit', metaScore.Function.proxy(this.onDetailsOverlaySubmit, this, ['update']));

        this.detailsOverlay.getField('type').readonly(true);

        metaScore.Dom.addListener(window, 'hashchange', metaScore.Function.proxy(this.onWindowHashChange, this));
        metaScore.Dom.addListener(window, 'beforeunload', metaScore.Function.proxy(this.onWindowBeforeUnload, this));

        this
            .addListener('mousedown', metaScore.Function.proxy(this.onMousedown, this))
            .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
            .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this))
            .addDelegate('.timefield', 'valuein', metaScore.Function.proxy(this.onTimeFieldIn, this))
            .addDelegate('.timefield', 'valueout', metaScore.Function.proxy(this.onTimeFieldOut, this))
            .setDirty(false)
            .setEditing(false)
            .updateMainmenu()
            .loadPlayerFromHash();
    }

    metaScore.Dom.extend(Editor);
    
    Editor.defaults = {
        'container': 'body',
        'player_url': '',
        'api_url': '',
        'help_url': '',
        'player_api_help_url': '',
        'account_url': '',
        'logout_url': '',
        'user_groups': {},
        'reload_player_on_save': false,
        'ajax': {}
    };

    /**
     * XHR error callback
     *
     * @method onXHRError
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    Editor.prototype.onXHRError = function(xhr){
        this.loadmask.hide();
        delete this.loadmask;

        new metaScore.overlay.Alert({
            'parent': this,
            'text': metaScore.Locale.t('editor.onXHRError.msg', 'The following error occured:<br/><strong><em>@code @error</em></strong><br/>Please try again.', {'@error': xhr.statusText, '@code': xhr.status}),
            'buttons': {
                'ok': metaScore.Locale.t('editor.onXHRError.ok', 'OK'),
            },
            'autoShow': true
        });
    };

    /**
     * Guide creation success callback
     *
     * @method onGuideCreateSuccess
     * @private
     * @param {GuideDetails} overlay The GuideDetails overlay that was used to create the guide
     * @param {XMLHttpRequest} xhr The XHR request
     */
    Editor.prototype.onGuideCreateSuccess = function(overlay, xhr){
        var json = JSON.parse(xhr.response);

        this.loadmask.hide();
        delete this.loadmask;

        overlay.hide();

        this.loadPlayer(json.id, json.vid);
    };

    /**
     * Guide saving success callback
     *
     * @method onGuideSaveSuccess
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    Editor.prototype.onGuideSaveSuccess = function(xhr){
        var player = this.getPlayer(),
            data = JSON.parse(xhr.response);

        this.loadmask.hide();
        delete this.loadmask;

        if((data.id !== player.getId()) || this.configs.reload_player_on_save){
            this.loadPlayer(data.id, data.vid);
        }
        else{
            this.detailsOverlay
                .clearValues(true)
                .setValues(data, true);

            player.updateData(data, true)
                  .setRevision(data.vid);
        
            this.setDirty(false)
                .updateMainmenu();
        }
    };

    /**
     * Guide deletion confirm callback
     *
     * @method onGuideDeleteConfirm
     * @private
     */
    Editor.prototype.onGuideDeleteConfirm = function(){
        var id = this.getPlayer().getId(),
            component, options;

        options = metaScore.Object.extend({}, {
            'dataType': 'json',
            'method': 'DELETE',
            'success': metaScore.Function.proxy(this.onGuideDeleteSuccess, this),
            'error': metaScore.Function.proxy(this.onXHRError, this)
        }, this.configs.ajax);

        this.loadmask = new metaScore.overlay.LoadMask({
            'parent': this,
            'autoShow': true
        });

        metaScore.Ajax.send(this.configs.api_url +'guide/'+ id +'.json', options);
    };

    /**
     * Guide deletion success callback
     *
     * @method onGuideDeleteSuccess
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    Editor.prototype.onGuideDeleteSuccess = function(xhr){
        this.unloadPlayer();

        this.loadmask.hide();
        delete this.loadmask;
    };

    /**
     * Guide revert confirm callback
     *
     * @method onGuideRevertConfirm
     * @private
     */
    Editor.prototype.onGuideRevertConfirm = function(){
        var player = this.getPlayer();

        this.loadPlayer(player.getId(), player.getRevision());
    };

    /**
     * GuideSelector submit callback
     *
     * @method onGuideSelectorSubmit
     * @param {CustomEvent} evt The event object. See {{#crossLink "GuideSelector/submit:event"}}GuideSelector.submit{{/crossLink}}
     */
    Editor.prototype.onGuideSelectorSubmit = function(evt){
        this.loadPlayer(evt.detail.guide.id, evt.detail.vid);
    };

    /**
     * Keydown event callback
     *
     * @method onKeydown
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    Editor.prototype.onKeydown = function(evt){
        var player;

        switch(evt.keyCode){
            case 18: //alt
                if(!evt.repeat){
                    this.setEditing(!this.persistentEditing, false);
                    evt.preventDefault();
                }
                break;

            case 72: //h
                if(evt.ctrlKey){ // Ctrl+h
                    player = this.getPlayer();
                    if(player){
                        player.addClass('show-contents');
                    }
                    evt.preventDefault();
                }
                break;

            case 90: //z
                if(evt.ctrlKey){ // Ctrl+z
                    this.history.undo();
                    evt.preventDefault();
                }
                break;

            case 89: //y
                if(evt.ctrlKey){ // Ctrl+y
                    this.history.redo();
                    evt.preventDefault();
                }
                break;
        }
    };

    /**
     * Keyup event callback
     *
     * @method onKeyup
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    Editor.prototype.onKeyup = function(evt){
        var player;

        switch(evt.keyCode){
            case 18: //alt
                this.setEditing(this.persistentEditing, false);
                evt.preventDefault();
                break;

            case 72: //h
                if(evt.ctrlKey){ // Ctrl+h
                    player = this.getPlayer();
                    if(player){
                        player.removeClass('show-contents');
                    }
                    evt.preventDefault();
                }
                break;
        }
    };

    /**
     * Mousedown event callback
     *
     * @method onMousedown
     * @private
     * @param {CustomEvent} evt The event object
     */
    Editor.prototype.onMousedown = function(evt){
        if(this.player_contextmenu){
            this.player_contextmenu.hide();
        }
    };

    /**
     * Mainmenu click event callback
     *
     * @method onMainmenuClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    Editor.prototype.onMainmenuClick = function(evt){
        var callback;

        switch(metaScore.Dom.data(evt.target, 'action')){
            case 'new':
                callback = metaScore.Function.proxy(function(){
                    new metaScore.editor.overlay.GuideDetails({
                            'groups': this.configs.user_groups,
                            'autoShow': true
                        })
                        .addListener('show', metaScore.Function.proxy(this.onDetailsOverlayShow, this))
                        .addListener('submit', metaScore.Function.proxy(this.onDetailsOverlaySubmit, this, ['create']));
                }, this);

                if(this.isDirty()){
                    new metaScore.overlay.Alert({
                            'parent': this,
                            'text': metaScore.Locale.t('editor.onMainmenuClick.open.msg', 'Are you sure you want to open another guide?<br/><strong>Any unsaved data will be lost.</strong>'),
                            'buttons': {
                                'confirm': metaScore.Locale.t('editor.onMainmenuClick.open.yes', 'Yes'),
                                'cancel': metaScore.Locale.t('editor.onMainmenuClick.open.no', 'No')
                            },
                            'autoShow': true
                        })
                        .addListener('buttonclick', function(evt){
                            if(evt.detail.action === 'confirm'){
                                callback();
                            }
                        });
                }
                else{
                    callback();
                }
                break;

            case 'open':
                callback = metaScore.Function.proxy(this.openGuideSelector, this);

                if(this.isDirty()){
                    new metaScore.overlay.Alert({
                            'parent': this,
                            'text': metaScore.Locale.t('editor.onMainmenuClick.open.msg', 'Are you sure you want to open another guide?<br/><strong>Any unsaved data will be lost.</strong>'),
                            'buttons': {
                                'confirm': metaScore.Locale.t('editor.onMainmenuClick.open.yes', 'Yes'),
                                'cancel': metaScore.Locale.t('editor.onMainmenuClick.open.no', 'No')
                            },
                            'autoShow': true
                        })
                        .addListener('buttonclick', function(evt){
                            if(evt.detail.action === 'confirm'){
                                callback();
                            }
                        });
                }
                else{
                    callback();
                }
                break;

            case 'edit':
                this.detailsOverlay.show();
                break;

            case 'save':
                this.saveGuide('update');
                break;

            case 'clone':
                this.saveGuide('clone');
                break;

            case 'publish':
                callback = metaScore.Function.proxy(function(){
                    this.saveGuide('update', true);
                }, this);

                new metaScore.overlay.Alert({
                        'parent': this,
                        'text': metaScore.Locale.t('editor.onMainmenuClick.publish.msg', 'This action will make this version the public version.<br/>Are you sure you want to continue?'),
                        'buttons': {
                            'confirm': metaScore.Locale.t('editor.onMainmenuClick.publish.yes', 'Yes'),
                            'cancel': metaScore.Locale.t('editor.onMainmenuClick.publish.no', 'No')
                        },
                        'autoShow': true
                    })
                    .addListener('buttonclick', function(evt){
                        if(evt.detail.action === 'confirm'){
                            callback();
                        }
                    });
                break;

            case 'share':
                new metaScore.editor.overlay.Share({
                    'url': this.configs.player_url + this.getPlayer().getId(),
                    'api_help_url': this.configs.player_api_help_url,
                    'autoShow': true
                });
                break;

            case 'download':
                break;

            case 'delete':
                new metaScore.overlay.Alert({
                        'parent': this,
                        'text': metaScore.Locale.t('editor.onMainmenuClick.delete.msg', 'Are you sure you want to delete this guide?<br/><b style="color: #F00;">This action cannot be undone.</b>'),
                        'buttons': {
                            'confirm': metaScore.Locale.t('editor.onMainmenuClick.delete.yes', 'Yes'),
                            'cancel': metaScore.Locale.t('editor.onMainmenuClick.delete.no', 'No')
                        },
                        'autoShow': true
                    })
                    .addClass('delete-guide')
                    .addListener('buttonclick', metaScore.Function.proxy(function(evt){
                        if(evt.detail.action === 'confirm'){
                            this.onGuideDeleteConfirm();
                        }
                    }, this));
                break;

            case 'revert':
                new metaScore.overlay.Alert({
                        'parent': this,
                        'text': metaScore.Locale.t('editor.onMainmenuClick.revert.msg', 'Are you sure you want to revert back to the last saved version?<br/><strong>Any unsaved data will be lost.</strong>'),
                        'buttons': {
                            'confirm': metaScore.Locale.t('editor.onMainmenuClick.revert.yes', 'Yes'),
                            'cancel': metaScore.Locale.t('editor.onMainmenuClick.revert.no', 'No')
                        },
                        'autoShow': true
                    })
                    .addListener('buttonclick', metaScore.Function.proxy(function(evt){
                        if(evt.detail.action === 'confirm'){
                            this.onGuideRevertConfirm();
                        }
                    }, this));
                break;

            case 'undo':
                this.history.undo();
                break;

            case 'redo':
                this.history.redo();
                break;

            case 'edit-toggle':
                this.setEditing(!this.editing);
                break;

            case 'settings':
                break;

            case 'help':
                window.open(this.configs.help_url, '_blank');
                break;
        
            case 'account':
                window.location.href = this.configs.account_url;
                break;
                
            case 'logout':
                window.location.href = this.configs.logout_url;
                break;
        }
    };

    /**
     * Mainmenu time field valuechange event callback
     *
     * @method onMainmenuTimeFieldChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Time/valuechange:event"}}Time.valuechange{{/crossLink}}
     */
    Editor.prototype.onMainmenuTimeFieldChange = function(evt){
        var field = evt.target._metaScore,
            time = field.getValue();

        this.getPlayer().getMedia().setTime(time);
    };

    /**
     * Mainmenu reading index field valuechange event callback
     *
     * @method onMainmenuRindexFieldChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Number/valuechange:event"}}Number.valuechange{{/crossLink}}
     */
    Editor.prototype.onMainmenuRindexFieldChange = function(evt){
        var field = evt.target._metaScore,
            value = field.getValue();

        this.getPlayer().setReadingIndex(value, true);
    };

    /**
     * Time field valuein event callback
     *
     * @method onTimeFieldIn
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Time/valuein:event"}}Time.valuein{{/crossLink}}
     */
    Editor.prototype.onTimeFieldIn = function(evt){
        var field = evt.detail.field,
            time = this.getPlayer().getMedia().getTime();

        field.setValue(time);
    };

    /**
     * Time field valueout event callback
     *
     * @method onTimeFieldOut
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Time/valueout:event"}}Time.valueout{{/crossLink}}
     */
    Editor.prototype.onTimeFieldOut = function(evt){
        var time = evt.detail.value;

        this.getPlayer().getMedia().setTime(time);
    };

    /**
     * Sidebar resizestart event callback
     *
     * @method onSidebarResizeStart
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Resizable/resizestart:event"}}Resizable.resizestart{{/crossLink}}
     */
    Editor.prototype.onSidebarResizeStart = function(evt){
        this.addClass('sidebar-resizing');
    };

    /**
     * Sidebar resize event callback
     *
     * @method onSidebarResize
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Resizable/resize:event"}}Resizable.resize{{/crossLink}}
     */
    Editor.prototype.onSidebarResize = function(evt){
        var width = parseInt(this.sidebar_wrapper.css('width'), 10);

        this.workspace.css('right', width +'px');
    };

    /**
     * Sidebar resizeend event callback
     *
     * @method onSidebarResizeEnd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Resizable/resizeend:event"}}Resizable.resizeend{{/crossLink}}
     */
    Editor.prototype.onSidebarResizeEnd = function(evt){
        this.removeClass('sidebar-resizing');
    };

    /**
     * Sidebar resize handle dblclick event callback
     *
     * @method onSidebarResizeDblclick
     * @private
     * @param {MouseEvent} evt The event object
     */
    Editor.prototype.onSidebarResizeDblclick = function(evt){
        this.toggleClass('sidebar-hidden');

        this.toggleSidebarResizer();
    };

    /**
     * Block panel componentbeforeset event callback
     *
     * @method onBlockBeforeSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentbeforeset:event"}}Panel.componentbeforeset{{/crossLink}}
     */
    Editor.prototype.onBlockBeforeSet = function(evt){
        var block = evt.detail.component;

        this.panels.element.unsetComponent();
        this.panels.page.unsetComponent();
    };

    /**
     * Block panel componentset event callback
     *
     * @method onBlockSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentset:event"}}Panel.componentset{{/crossLink}}
     */
    Editor.prototype.onBlockSet = function(evt){
        var block = evt.detail.component;

        if(block.instanceOf('Block')){
            this.panels.page.getToolbar()
                .toggleMenuItem('new', true);

            this.panels.page.setComponent(block.getActivePage());

            this.panels.element.getToolbar()
                .toggleMenuItem('Cursor', true)
                .toggleMenuItem('Image', true)
                .toggleMenuItem('Text', true);
        }

        this.updatePageSelector();

        evt.stopPropagation();
    };

    /**
     * Block panel componentunset event callback
     *
     * @method onBlockUnset
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentunset:event"}}Panel.componentunset{{/crossLink}}
     */
    Editor.prototype.onBlockUnset = function(evt){
        this.panels.page.unsetComponent();
        this.panels.page.getToolbar().toggleMenuItem('new', false);
    };

    /**
     * Block panel valuechange event callback
     *
     * @method onBlockPanelValueChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/valueschange:event"}}Panel.valueschange{{/crossLink}}
     */
    Editor.prototype.onBlockPanelValueChange = function(evt){
        var panel = this.panels.block,
            block = evt.detail.component,
            old_values = evt.detail.old_values,
            new_values = evt.detail.new_values;

        this.history.add({
            'undo': function(){
                panel.updateProperties(block, old_values);
            },
            'redo': function(){
                panel.updateProperties(block, new_values);
            }
        });

        if(!block.instanceOf('BlockToggler')){
            if(('x' in new_values) || ('y' in new_values) || ('width' in new_values) || ('height' in new_values)){
                this.getPlayer().updateBlockTogglers();
            }
        }
    };

    /**
     * Block panel toolbar click event callback
     *
     * @method onBlockPanelToolbarClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    Editor.prototype.onBlockPanelToolbarClick = function(evt){
        var block,
            action = metaScore.Dom.data(evt.target, 'action');

        switch(action){
            case 'synched':
            case 'non-synched':
                this.addPlayerComponent('block', {'synched': action === 'synched'}, this.getPlayer());
                break;

            case 'block-toggler':
                this.addPlayerComponent('block-toggler', {}, this.getPlayer());
                break;

            case 'delete':
                block = this.panels.block.getComponent();
                this.deletePlayerComponent(block, true);
                break;
        }

        evt.stopPropagation();
    };

    /**
     * Block panel toolbar selector valuechange event callback
     *
     * @method onBlockPanelSelectorChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Select/valueschange:event"}}Select.valueschange{{/crossLink}}
     */
    Editor.prototype.onBlockPanelSelectorChange = function(evt){
        var id = evt.detail.value,
            dom;

        if(!id){
            this.panels.block.unsetComponent();
        }
        else{
            dom = this.getPlayer().getComponent('.media#'+ id +', .controller#'+ id +', .block#'+ id +', .block-toggler#'+ id);

            if(dom && dom._metaScore){
                this.panels.block.setComponent(dom._metaScore);
            }
        }
    };

    /**
     * Page panel componentbeforeset event callback
     *
     * @method onPageBeforeSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentbeforeset:event"}}Panel.componentbeforeset{{/crossLink}}
     */
    Editor.prototype.onPageBeforeSet = function(evt){
        var page = evt.detail.component,
            block = page.getBlock();

        this.panels.element.unsetComponent();
        this.panels.block.setComponent(block);
    };

    /**
     * Page panel componentset event callback
     *
     * @method onPageSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentset:event"}}Panel.componentset{{/crossLink}}
     */
    Editor.prototype.onPageSet = function(evt){        
        var page = evt.detail.component,
            block = this.panels.block.getComponent(),
            index, previous_page, next_page,
            start_time_field = this.panels.page.getField('start-time'),
            end_time_field = this.panels.page.getField('end-time');

        this.panels.page.getToolbar().toggleMenuItem('new', true);

        this.panels.element
            .unsetComponent()
            .getToolbar()
                .toggleMenuItem('Cursor', true)
                .toggleMenuItem('Image', true)
                .toggleMenuItem('Text', true);

        if(block.getProperty('synched')){
            index = block.getActivePageIndex();
            previous_page = block.getPage(index-1);
            next_page = block.getPage(index+1);

            if(previous_page){
                start_time_field.readonly(false).enable().setMin(previous_page.getProperty('start-time'));
            }
            else{
                start_time_field.readonly(true).enable();
            }

            if(next_page){
                end_time_field.readonly(false).enable().setMax(next_page.getProperty('end-time'));
            }
            else{
                end_time_field.readonly(true).enable();
            }
        }
        else{
            start_time_field.disable();
            end_time_field.disable();
        }

        this.updateElementSelector();

        evt.stopPropagation();
    };

    /**
     * Page panel componentunset event callback
     *
     * @method onPageUnset
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentunset:event"}}Panel.componentunset{{/crossLink}}
     */
    Editor.prototype.onPageUnset = function(evt){
        this.panels.element
            .unsetComponent()
            .getToolbar()
                .toggleMenuItem('Cursor', false)
                .toggleMenuItem('Image', false)
                .toggleMenuItem('Text', false);
    };

    /**
     * Page panel valuechange event callback
     *
     * @method onPagePanelValueChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/valueschange:event"}}Panel.valueschange{{/crossLink}}
     */
    Editor.prototype.onPagePanelValueChange = function(evt){
        var editor = this,
            panel = this.panels.page,
            page = evt.detail.component,
            old_values = evt.detail.old_values,
            new_values = evt.detail.new_values,
            block, index, previous_page, next_page;

        if(('start-time' in new_values) || ('end-time' in new_values)){
            if((block = page.getBlock()) && block.getProperty('synched')){
                index = block.getActivePageIndex();
                previous_page = block.getPage(index-1);
                next_page = block.getPage(index+1);

                if(('start-time' in new_values) && previous_page){
                    previous_page.setProperty('end-time', new_values['start-time']);
                }

                if(('end-time' in new_values) && next_page){
                    next_page.setProperty('start-time', new_values['end-time']);
                }
            }

            editor.updateElementSelector();
        }

        this.history.add({
            'undo': function(){
                panel.updateProperties(page, old_values);

                if(('start-time' in new_values) || ('end-time' in new_values)){
                    if(('start-time' in new_values) && previous_page){
                        previous_page.setProperty('end-time', old_values['start-time']);
                    }

                    if(('end-time' in new_values) && next_page){
                        next_page.setProperty('start-time', old_values['end-time']);
                    }

                    editor.updateElementSelector();
                }
            },
            'redo': function(){
                panel.updateProperties(page, new_values);

                if(('start-time' in new_values) || ('end-time' in new_values)){
                    if(('start-time' in new_values) && previous_page){
                        previous_page.setProperty('end-time', new_values['start-time']);
                    }

                    if(('end-time' in new_values) && next_page){
                        next_page.setProperty('start-time', new_values['end-time']);
                    }

                    editor.updateElementSelector();
                }
            }
        });
    };

    /**
     * Page panel toolbar click event callback
     *
     * @method onPagePanelToolbarClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    Editor.prototype.onPagePanelToolbarClick = function(evt){
        var block, page,
            action = metaScore.Dom.data(evt.target, 'action');

        switch(action){
            case 'new':
                block = this.panels.block.getComponent();
                this.addPlayerComponent('page', {}, block);
                break;

            case 'delete':
                page = this.panels.page.getComponent();
                this.deletePlayerComponent(page, true);
                break;
        }

        evt.stopPropagation();
    };

    /**
     * Page panel toolbar selector valuechange event callback
     *
     * @method onPagePanelSelectorChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Select/valueschange:event"}}Select.valueschange{{/crossLink}}
     */
    Editor.prototype.onPagePanelSelectorChange = function(evt){
        var block = this.panels.block.getComponent(),
            id, dom;

        if(block){
            id = evt.detail.value;
            dom = this.getPlayer().getComponent('.page#'+ id);

            if(dom && dom._metaScore){
                block.setActivePage(dom._metaScore);
            }
        }
    };

    /**
     * Element panel componentbeforeset event callback
     *
     * @method onElementBeforeSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentbeforeset:event"}}Panel.componentbeforeset{{/crossLink}}
     */
    Editor.prototype.onElementBeforeSet = function(evt){
        var element = evt.detail.component,
            page = element.parents().get(0)._metaScore;

        this.panels.page.setComponent(page);
    };

    /**
     * Element panel componentset event callback
     *
     * @method onElementSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentset:event"}}Panel.componentset{{/crossLink}}
     */
    Editor.prototype.onElementSet = function(evt){
        var element = evt.detail.component,
            player = this.getPlayer();

        player.setReadingIndex(element.getProperty('r-index') || 0);

        evt.stopPropagation();
    };

    /**
     * Element panel valuechange event callback
     *
     * @method onElementPanelValueChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/valueschange:event"}}Panel.valueschange{{/crossLink}}
     */
    Editor.prototype.onElementPanelValueChange = function(evt){
        var editor = this,
            panel = this.panels.element,
            element = evt.detail.component,
            old_values = evt.detail.old_values,
            new_values = evt.detail.new_values;

        if(('start-time' in new_values) || ('end-time' in new_values)){
            editor.updateElementSelector();
        }

        this.history.add({
            'undo': function(){
                panel.updateProperties(element, old_values);

                if(('start-time' in new_values) || ('end-time' in new_values)){
                    editor.updateElementSelector();
                }
            },
            'redo': function(){
                panel.updateProperties(element, new_values);

                if(('start-time' in new_values) || ('end-time' in new_values)){
                    editor.updateElementSelector();
                }
            }
        });
    };

    /**
     * Element panel toolbar click event callback
     *
     * @method onElementPanelToolbarClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    Editor.prototype.onElementPanelToolbarClick = function(evt){
        var page, element,
            action = metaScore.Dom.data(evt.target, 'action');

        switch(action){
            case 'Cursor':
            case 'Image':
            case 'Text':
                page = this.panels.page.getComponent();
                this.addPlayerComponent('element', {'type': action}, page);
                break;

            case 'delete':
                element = this.panels.element.getComponent();   
                this.deletePlayerComponent(element, true);
                break;
        }
    };

    /**
     * Element panel toolbar selector valuechange event callback
     *
     * @method onPagePanelSelectorChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Select/valueschange:event"}}Select.valueschange{{/crossLink}}
     */
    Editor.prototype.onElementPanelSelectorChange = function(evt){
        var id = evt.detail.value,
            dom;

        if(!id){
            this.panels.element.unsetComponent();
        }
        else{
            dom = this.getPlayer().getComponent('.element#'+ id);

            if(dom && dom._metaScore){
                this.panels.element.setComponent(dom._metaScore);
            }
        }
    };

    /**
     * Player idset event callback
     *
     * @method onPlayerIdSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/idset:event"}}Player.idset{{/crossLink}}
     */
    Editor.prototype.onPlayerIdSet = function(evt){
        var player = evt.detail.player;

        window.history.replaceState(null, null, '#guide='+ player.getId() +':'+ player.getRevision());
    };

    /**
     * Player revisionset event callback
     *
     * @method onPlayerRevisionSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/revisionset:event"}}Player.revisionset{{/crossLink}}
     */
    Editor.prototype.onPlayerRevisionSet = function(evt){
        var player = evt.detail.player;

        window.history.replaceState(null, null, '#guide='+ player.getId() +':'+ player.getRevision());
    };

    /**
     * Player loadedmetadata event callback
     *
     * @method onPlayerLoadedMetadata
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Media/loadedmetadata:event"}}Media.loadedmetadata{{/crossLink}}
     */
    Editor.prototype.onPlayerLoadedMetadata = function(evt){        
        this.mainmenu.timefield.setMax(this.player.getMedia().getDuration());
    };

    /**
     * Media timeupdate event callback
     *
     * @method onPlayerTimeUpdate
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Media/timeupdate:event"}}Media.timeupdate{{/crossLink}}
     */
    Editor.prototype.onPlayerTimeUpdate = function(evt){
        var time = evt.detail.media.getTime();

        this.mainmenu.timefield.setValue(time, true);
    };

    /**
     * Player rindex event callback
     *
     * @method onPlayerReadingIndex
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/rindex:event"}}Player.rindex{{/crossLink}}
     */
    Editor.prototype.onPlayerReadingIndex = function(evt){
        var rindex = evt.detail.value;

        this.mainmenu.rindexfield.setValue(rindex, true);
    };

    /**
     * Player mousedown event callback
     *
     * @method onPlayerMousedown
     * @private
     * @param {CustomEvent} evt The event object
     */
    Editor.prototype.onPlayerMousedown = function(evt){
        this.contextmenu.hide();
    };

    /**
     * Player mediaadd event callback
     *
     * @method onPlayerMediaAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/mediaadd:event"}}Player.blockadd{{/crossLink}}
     */
    Editor.prototype.onPlayerMediaAdd = function(evt){
        this.updateBlockSelector();
        
        this.getPlayer().updateBlockTogglers();
    };

    /**
     * Player controlleradd event callback
     *
     * @method onPlayerControllerAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/controlleradd:event"}}Player.blockadd{{/crossLink}}
     */
    Editor.prototype.onPlayerControllerAdd = function(evt){
        this.updateBlockSelector();

        this.getPlayer().updateBlockTogglers();
    };

    /**
     * Player blocktaggleradd event callback
     *
     * @method onPlayerBlockTogglerAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/blocktaggleradd:event"}}Player.blockadd{{/crossLink}}
     */
    Editor.prototype.onPlayerBlockTogglerAdd = function(evt){
        this.updateBlockSelector();

        var blocks = this.getPlayer().getComponents('.block, .media.video, .controller');
        evt.detail.blocktoggler.update(blocks);
    };

    /**
     * Player blockadd event callback
     *
     * @method onPlayerBlockAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/blockadd:event"}}Player.blockadd{{/crossLink}}
     */
    Editor.prototype.onPlayerBlockAdd = function(evt){
        this.updateBlockSelector();

        this.getPlayer().updateBlockTogglers();
    };

    /**
     * Player childremove event callback
     *
     * @method onPlayerChildRemove
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Dom/childremove:event"}}Dom.childremove{{/crossLink}}
     */
    Editor.prototype.onPlayerChildRemove = function(evt){
        var child = evt.detail.child,
            component = child._metaScore;

        if(component){
            if(component.instanceOf('Block') || component.instanceOf('BlockToggler') || component.instanceOf('Media') || component.instanceOf('Controller')){
                this.updateBlockSelector();
                
                if(!component.instanceOf('BlockToggler')){
                    this.getPlayer().updateBlockTogglers();
                }
            }
            else if(component.instanceOf('Page')){
                this.updatePageSelector();
            }
            else if(component.instanceOf('Element')){
                this.updateElementSelector();
            }
        }
    };

    /**
     * Player frame load event callback
     *
     * @method onPlayerFrameLoadSuccess
     * @private
     * @param {UIEvent} evt The event object
     */
    Editor.prototype.onPlayerFrameLoadSuccess = function(evt){
        var player = this.player_frame.get(0).contentWindow.player;
    
        if(player){
            player
                .addListener('load', metaScore.Function.proxy(this.onPlayerLoadSuccess, this))
                .addListener('error', metaScore.Function.proxy(this.onPlayerLoadError, this))
                .addListener('idset', metaScore.Function.proxy(this.onPlayerIdSet, this))
                .addListener('revisionset', metaScore.Function.proxy(this.onPlayerRevisionSet, this))
                .addListener('loadedmetadata', metaScore.Function.proxy(this.onPlayerLoadedMetadata, this))
                .load();
        }
    };

    /**
     * Player frame error event callback
     *
     * @method onPlayerFrameLoadError
     * @private
     * @param {UIEvent} evt The event object
     */
    Editor.prototype.onPlayerFrameLoadError = function(evt){
        this.loadmask.hide();
        delete this.loadmask;

        new metaScore.overlay.Alert({
            'parent': this,
            'text': metaScore.Locale.t('editor.onPlayerLoadError.msg', 'An error occured while trying to load the guide. Please try again.'),
            'buttons': {
                'ok': metaScore.Locale.t('editor.onPlayerLoadError.ok', 'OK'),
            },
            'autoShow': true
        });
    };

    /**
     * Player load event callback
     *
     * @method onPlayerLoadSuccess
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/load:event"}}Player.load{{/crossLink}}
     */
    Editor.prototype.onPlayerLoadSuccess = function(evt){
        var player_body = this.player_frame.get(0).contentWindow.document.body,
            data;
        
        this.player = evt.detail.player
            .addClass('in-editor')
            .addDelegate('.metaScore-component', 'beforedrag', metaScore.Function.proxy(this.onComponentBeforeDrag, this))
            .addDelegate('.metaScore-component', 'click', metaScore.Function.proxy(this.onComponentClick, this))
            .addDelegate('.metaScore-component.block', 'pageadd', metaScore.Function.proxy(this.onBlockPageAdd, this))
            .addDelegate('.metaScore-component.block', 'pageactivate', metaScore.Function.proxy(this.onBlockPageActivate, this))
            .addDelegate('.metaScore-component.page', 'elementadd', metaScore.Function.proxy(this.onPageElementAdd, this))
            .addListener('mousedown', metaScore.Function.proxy(this.onPlayerMousedown, this))
            .addListener('mediaadd', metaScore.Function.proxy(this.onPlayerMediaAdd, this))
            .addListener('controlleradd', metaScore.Function.proxy(this.onPlayerControlleAdd, this))
            .addListener('blocktoggleradd', metaScore.Function.proxy(this.onPlayerBlockTogglerAdd, this))
            .addListener('blockadd', metaScore.Function.proxy(this.onPlayerBlockAdd, this))
            .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
            .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this))
            .addListener('click', metaScore.Function.proxy(this.onPlayerClick, this))
            .addListener('timeupdate', metaScore.Function.proxy(this.onPlayerTimeUpdate, this))
            .addListener('rindex', metaScore.Function.proxy(this.onPlayerReadingIndex, this))
            .addListener('childremove', metaScore.Function.proxy(this.onPlayerChildRemove, this));
            
        this.player.contextmenu
            .disable();
        
        this.player_contextmenu
            .setTarget(player_body)
            .enable();
            
        data = this.player.getData();

        new metaScore.Dom(player_body)
            .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
            .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this));

        this
            .setEditing(true)
            .updateMainmenu()
            .updateBlockSelector();

        this.mainmenu
            .toggleButton('save', data.permissions.update)
            .toggleButton('clone', data.permissions.clone)
            .toggleButton('publish', data.permissions.update)
            .toggleButton('delete', data.permissions.delete);

        this.mainmenu.rindexfield.setValue(0, true);

        this.detailsOverlay
            .clearValues(true)
            .setValues(data, true);

        this.loadmask.hide();
        delete this.loadmask;
    };

    /**
     * Player error event callback
     *
     * @method onPlayerLoadError
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/error:event"}}Player.error{{/crossLink}}
     */
    Editor.prototype.onPlayerLoadError = function(evt){
        this.loadmask.hide();
        delete this.loadmask;

        new metaScore.overlay.Alert({
            'parent': this,
            'text': metaScore.Locale.t('editor.onPlayerLoadError.msg', 'An error occured while trying to load the guide. Please try again.'),
            'buttons': {
                'ok': metaScore.Locale.t('editor.onPlayerLoadError.ok', 'OK'),
            },
            'autoShow': true
        });
    };

    /**
     * Player click event callback
     *
     * @method onPlayerClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    Editor.prototype.onPlayerClick = function(evt){
        if(this.editing !== true){
            return;
        }

        this.panels.block.unsetComponent();

        evt.stopPropagation();
    };

    /**
     * Component beforedrag event callback
     *
     * @method onComponentBeforeDrag
     * @private
     * @param {Event} evt The event object
     */
    Editor.prototype.onComponentBeforeDrag = function(evt){
        if(this.editing !== true){
            evt.preventDefault();
        }
    };

    /**
     * Component click event callback
     *
     * @method onComponentClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    Editor.prototype.onComponentClick = function(evt, dom){
        var component;

        if(this.editing !== true){
            return;
        }

        component = dom._metaScore;

        if(component.instanceOf('Element')){
            this.panels.element.setComponent(component);
        }
        else if(component.instanceOf('Page')){
            this.panels.page.setComponent(component);
        }
        else{
            this.panels.block.setComponent(component);
        }

        evt.stopImmediatePropagation();
    };

    /**
     * Block pageadd event callback
     *
     * @method onBlockPageAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Block/pageadd:event"}}Block.pageadd{{/crossLink}}
     */
    Editor.prototype.onBlockPageAdd = function(evt){
        var block = evt.detail.block;

        if(block === this.panels.block.getComponent()){
            this.updatePageSelector();
        }

        evt.stopPropagation();
    };

    /**
     * Block pageactivate event callback
     *
     * @method onBlockPageActivate
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Block/pageactivate:event"}}Block.pageactivate{{/crossLink}}
     */
    Editor.prototype.onBlockPageActivate = function(evt){
        var page, basis;

        if(this.editing !== true){
            return;
        }

        page = evt.detail.page;
        basis = evt.detail.basis;

        if((basis !== 'pagecuepoint') || (page.getBlock() === this.panels.block.getComponent())){
            this.panels.page.setComponent(page);
        }
    };

    /**
     * Page elementadd event callback
     *
     * @method onPageElementAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Page/elementadd:event"}}Page.elementadd{{/crossLink}}
     */
    Editor.prototype.onPageElementAdd = function(evt){
        var page = evt.detail.page,
            block, media;
        
        if((evt.detail.new) && (evt.detail.element.data('type') === 'Cursor')){
            block = page.getBlock();
            media = this.getPlayer().getMedia();
            
            evt.detail.element
                .setProperty('start-time', media.getTime())
                .setProperty('end-time', block.getProperty('synched') ? page.getProperty('end-time') : media.getDuration());
        }

        if(page === this.panels.page.getComponent()){
            this.updateElementSelector();
        }

        evt.stopPropagation();
    };

    /**
     * History add event callback
     *
     * @method onHistoryAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "History/add:event"}}History.add{{/crossLink}}
     */
    Editor.prototype.onHistoryAdd = function(evt){
        this.setDirty(true)
            .updateMainmenu();
    };

    /**
     * History undo event callback
     *
     * @method onHistoryUndo
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "History/undo:event"}}History.undo{{/crossLink}}
     */
    Editor.prototype.onHistoryUndo = function(evt){
        this.updateMainmenu();
    };

    /**
     * History redo event callback
     *
     * @method onHistoryRedo
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "History/redo:event"}}History.redo{{/crossLink}}
     */
    Editor.prototype.onHistoryRedo = function(evt){
        this.updateMainmenu();
    };

    /**
     * GuideDetails show event callback
     *
     * @method onDetailsOverlayShow
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Overlay/show:event"}}Overlay.show{{/crossLink}}
     */
    Editor.prototype.onDetailsOverlayShow = function(evt){
        var player = this.getPlayer();

        if(player){
            player.getMedia().pause();
        }
    };

    /**
     * GuideDetails submit event callback
     *
     * @method onDetailsOverlaySubmit
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "GuideDetails/submit:event"}}GuideDetails.submit{{/crossLink}}
     */
    Editor.prototype.onDetailsOverlaySubmit = function(op, evt){
        var overlay = evt.detail.overlay,
            data = evt.detail.values,
            player, callback;

        switch(op){
            case 'create':
                this.createGuide(data, overlay);
                break;

            case 'update':
                player = this.getPlayer();

                callback = metaScore.Function.proxy(function(new_duration){
                    if(new_duration){
                        player.getComponents('.block').each(function(index, block_dom){
                            var block, page;
                            
                            if(block_dom._metaScore){
                                block = block_dom._metaScore;

                                if(block.getProperty('synched')){
                                    page = block.getPage(block.getPageCount()-1);
                                    if(page){
                                        page.setProperty('end-time', new_duration);
                                    }
                                }
                            }
                        });
                    }
                    
                    player.updateData(data);
                    overlay.setValues(metaScore.Object.extend({}, player.getData(), data), true).hide();

                    this.mainmenu.timefield.setMax(new_duration);
                    
                    this.setDirty(true)
                        .updateMainmenu();
                }, this);

                if('media' in data){
                    this.getMediaFileDuration(data['media'].url, metaScore.Function.proxy(function(new_duration){
                        var old_duration = player.getMedia().getDuration(),
                            formatted_old_duration, formatted_new_duration,
                            blocks = [], block, page, msg;

                        if(new_duration !== old_duration){
                            formatted_old_duration = (parseInt((old_duration / 360000), 10) || 0);
                            formatted_old_duration += ":";
                            formatted_old_duration += metaScore.String.pad(parseInt((old_duration / 6000) % 60, 10) || 0, 2, "0", "left");
                            formatted_old_duration += ":";
                            formatted_old_duration += metaScore.String.pad(parseInt((old_duration / 100) % 60, 10) || 0, 2, "0", "left");
                            formatted_old_duration += ".";
                            formatted_old_duration += metaScore.String.pad(parseInt((old_duration) % 100, 10) || 0, 2, "0", "left");
                                                     
                            formatted_new_duration = (parseInt((new_duration / 360000), 10) || 0);
                            formatted_new_duration += ":";
                            formatted_new_duration += metaScore.String.pad(parseInt((new_duration / 6000) % 60, 10) || 0, 2, "0", "left");
                            formatted_new_duration += ":";
                            formatted_new_duration += metaScore.String.pad(parseInt((new_duration / 100) % 60, 10) || 0, 2, "0", "left");
                            formatted_new_duration += ".";
                            formatted_new_duration += metaScore.String.pad(parseInt((new_duration) % 100, 10) || 0, 2, "0", "left");
                            
                            if(new_duration < old_duration){
                                player.getComponents('.block').each(function(index, block_dom){
                                    if(block_dom._metaScore){
                                        block = block_dom._metaScore;

                                        if(block.getProperty('synched')){
                                            metaScore.Array.each(block.getPages(), function(index, page){
                                                if(page.getProperty('start-time') > new_duration){
                                                    blocks.push(block.getProperty('name'));
                                                    return false;
                                                }
                                            });
                                        }
                                    }
                                });
                            }

                            if(blocks.length > 0){
                                new metaScore.overlay.Alert({
                                    'parent': this,
                                    'text': metaScore.Locale.t('editor.onDetailsOverlaySubmit.update.needs_review.msg', 'The duration of selected media (!new_duration) is less than the current one (!old_duration).<br/><strong>Pages with a start time after !new_duration will therefore be out of reach. This applies to blocks: !blocks</strong><br/>Please delete those pages or modify their start time and try again.', {'!new_duration': formatted_new_duration, '!old_duration': formatted_old_duration, '!blocks': blocks.join(', ')}),
                                    'buttons': {
                                        'ok': metaScore.Locale.t('editor.onDetailsOverlaySubmit.update.needs_review.ok', 'OK'),
                                    },
                                    'autoShow': true
                                });
                            }
                            else{
                                if(new_duration < old_duration){
                                    msg = metaScore.Locale.t('editor.onDetailsOverlaySubmit.update.shorter.msg', 'The duration of selected media (!new_duration) is less than the current one (!old_duration).<br/><strong>It will probably be necessary to resynchronize the pages and elements whose end time is greater than that of the selected media.</strong><br/>Are you sure you want to use the new media file?', {'!new_duration': formatted_new_duration, '!old_duration': formatted_old_duration});
                                }
                                else{                                    
                                    msg = metaScore.Locale.t('editor.onDetailsOverlaySubmit.update.longer.msg', 'The duration of selected media (!new_duration) is greater than the current one (!old_duration).<br/><strong>It will probably be necessary to resynchronize the pages and elements whose end time is equal to that of the current media.</strong><br/>Are you sure you want to use the new media file?', {'!new_duration': formatted_new_duration, '!old_duration': formatted_old_duration});
                                }
                                
                                new metaScore.overlay.Alert({
                                    'parent': this,
                                    'text': msg,
                                    'buttons': {
                                        'confirm': metaScore.Locale.t('editor.onDetailsOverlaySubmit.update.diffferent.yes', 'Yes'),
                                        'cancel': metaScore.Locale.t('editor.onDetailsOverlaySubmit.update.diffferent.no', 'No')
                                    },
                                    'autoShow': true
                                })
                                .addListener('buttonclick', function(evt){
                                    if(evt.detail.action === 'confirm'){
                                        callback(new_duration);
                                    }
                                });
                            }
                        }
                        else{
                            callback();
                        }
                    }, this));
                }
                else{
                    callback();
                }
                break;
        }
    };

    /**
     * Window hashchange event callback
     *
     * @method onWindowHashChange
     * @private
     * @param {HashChangeEvent} evt The event object
     */
    Editor.prototype.onWindowHashChange = function(evt){
        var callback = metaScore.Function.proxy(this.loadPlayerFromHash, this),
            oldURL = evt.oldURL;

        if(this.isDirty()){
            new metaScore.overlay.Alert({
                    'parent': this,
                    'text': metaScore.Locale.t('editor.onWindowHashChange.alert.msg', 'Are you sure you want to open another guide?<br/><strong>Any unsaved data will be lost.</strong>'),
                    'buttons': {
                        'confirm': metaScore.Locale.t('editor.onWindowHashChange.alert.yes', 'Yes'),
                        'cancel': metaScore.Locale.t('editor.onWindowHashChange.alert.no', 'No')
                    },
                    'autoShow': true
                })
                .addListener('buttonclick', function(evt){
                    if(evt.detail.action === 'confirm'){
                        callback();
                    }
                    else{
                        window.history.replaceState(null, null, oldURL);
                    }
                });
        }
        else{
            callback();
        }

        evt.preventDefault();
    };

    /**
     * Window beforeunload event callback
     *
     * @method onWindowBeforeUnload
     * @private
     * @param {Event} evt The event object
     */
    Editor.prototype.onWindowBeforeUnload = function(evt){
        if(this.isDirty()){
            evt.returnValue = metaScore.Locale.t('editor.onWindowBeforeUnload.msg', 'Any unsaved data will be lost.');
        }
    };

    /**
     * Updates the editing state
     *
     * @method setEditing
     * @param {Boolean} editing The new state
     * @param {Boolean} sticky Whether the new state is persistent or temporary
     * @chainable
     */
    Editor.prototype.setEditing = function(editing, sticky){
        var player = this.getPlayer();

        this.editing = editing !== false;

        if(sticky !== false){
            this.persistentEditing = this.editing;
        }

        metaScore.Object.each(this.panels, function(key, panel){
            if(this.editing){
                panel.enable();
            }
            else{
                panel.disable();
            }
        }, this);

        this.toggleClass('editing', this.editing);

        if(player){
            player.toggleClass('editing', this.editing);
        }

        this.toggleSidebarResizer();

        return this;

    };

    /**
     * Toggles the activation of the sidebar resizer
     *
     * @method toggleSidebarResizer
     * @private
     * @chainable
     */
    Editor.prototype.toggleSidebarResizer = function(){
        if(!this.hasClass('editing') || this.hasClass('sidebar-hidden')){
            this.sidebar_resizer.disable();
        }
        else{
            this.sidebar_resizer.enable();
        }

        return this;
    };

    /**
     * Loads a player from the location hash
     *
     * @method loadPlayerFromHash
     * @private
     * @chainable
     */
    Editor.prototype.loadPlayerFromHash = function(){
        var hash, match;

        hash = window.location.hash;

        if(match = hash.match(/(#|&)guide=(\w+)(:(\d+))?/)){
            this.loadPlayer(match[2], match[4]);
        }

        return this;
    };

    /**
     * Updates the states of the mainmenu buttons
     *
     * @method updateMainmenu
     * @private
     * @chainable
     */
    Editor.prototype.updateMainmenu = function(){
        var player = this.getPlayer(),
            hasPlayer = player ? true : false;

        this.mainmenu.toggleButton('edit', hasPlayer);
        this.mainmenu.toggleButton('save', hasPlayer);
        this.mainmenu.toggleButton('clone', hasPlayer);
        this.mainmenu.toggleButton('publish', hasPlayer);
        this.mainmenu.toggleButton('delete', hasPlayer);
        this.mainmenu.toggleButton('share', hasPlayer && player.getData('published'));
        this.mainmenu.toggleButton('download', hasPlayer);

        this.mainmenu.toggleButton('undo', this.history.hasUndo());
        this.mainmenu.toggleButton('redo', this.history.hasRedo());
        this.mainmenu.toggleButton('revert', this.isDirty());

        return this;
    };

    /**
     * Updates the selector of the block panel
     *
     * @method updateBlockSelector
     * @private
     * @chainable
     */
    Editor.prototype.updateBlockSelector = function(){
        var panel = this.panels.block,
            toolbar = panel.getToolbar(),
            selector = toolbar.getSelector(),
            block, label;

        selector
            .clear()
            .addOption(null, '');

        this.getPlayer().getComponents('.media.video, .controller, .block, .block-toggler').each(function(index, dom){
            if(dom._metaScore){
                block = dom._metaScore;                
                selector.addOption(block.getId(), panel.getSelectorLabel(block));
            }
        }, this);

        block = panel.getComponent();
        selector.setValue(block ? block.getId() : null, true);

        return this;
    };

    /**
     * Updates the selector of the page panel
     *
     * @method updatePageSelector
     * @private
     * @chainable
     */
    Editor.prototype.updatePageSelector = function(){
        var block = this.panels.block.getComponent(),
            page = this.panels.page.getComponent(),
            toolbar = this.panels.page.getToolbar(),
            selector = toolbar.getSelector();

        selector.clear();

        if(block && block.instanceOf('Block')){
            metaScore.Array.each(block.getPages(), function(index, page){
                selector.addOption(page.getId(), index+1);
            });
        }

        selector.setValue(page ? page.getId() : null, true);

        return this;
    };

    /**
     * Updates the selector of the element panel
     *
     * @method updateElementSelector
     * @private
     * @chainable
     */
    Editor.prototype.updateElementSelector = function(){
        var panel = this.panels.element,
            block = this.panels.block.getComponent(),
            page = this.panels.page.getComponent(),
            toolbar = panel.getToolbar(),
            selector = toolbar.getSelector(),
            element, rindex, optgroups = {};

        // clear the selector
        selector.clear();

        // fill the list of optgroups
        if(page.instanceOf('Page')){
            metaScore.Array.each(page.getElements(), function(index, element){
                rindex = element.getProperty('r-index') || 0;

                if(!(rindex in optgroups)){
                    optgroups[rindex] = [];
                }

                optgroups[rindex].push(element);
            }, this);
        }

        // create the optgroups and their options
        metaScore.Array.each(Object.keys(optgroups).sort(metaScore.Array.naturalSortInsensitive), function(index, rindex){
            var options = optgroups[rindex],
                optgroup;

            // sort options by element names
            options.sort(function(a, b){
                return metaScore.Array.naturalSortInsensitive(a.getName(), b.getName());
            });

            // create the optgroup
            optgroup = selector.addGroup(metaScore.Locale.t('editor.elementSelectorGroupLabel', 'Reading index !rindex', {'!rindex': rindex})).attr('data-r-index', rindex);

            // create the options
            metaScore.Array.each(options, function(index, element){
                selector.addOption(element.getId(), panel.getSelectorLabel(element), optgroup);
            }, this);
        }, this);

        element = panel.getComponent();

        selector.setValue(element ? element.getId() : null, true);

        return this;
    };

    /**
     * Set whether the guide is dirty
     *
     * @method setDirty
     * @param {Boolean} dirty Whether the guide is dirty
     * @chainable
     */
    Editor.prototype.setDirty = function(dirty){
        this.dirty = dirty;
        
        return this;
    };

    /**
     * Check whether the guide is dirty
     *
     * @method isDirty
     * @return {Boolean} Whether the guide is dirty
     */
    Editor.prototype.isDirty = function(){
        return this.dirty;
    };

    /**
     * Get the player instance if any
     *
     * @method getPlayer
     * @return {Player} The player instance
     */
    Editor.prototype.getPlayer = function(){
        return this.player;
    };

    /**
     * Loads a player by guide id and vid
     *
     * @method loadPlayer
     * @param {String} id The guide's id
     * @param {Integer} vid The guide's revision id
     * @chainable
     */
    Editor.prototype.loadPlayer = function(id, vid){
        var url = this.configs.player_url + id +"?autoload=false&keyboard=1";

        if(vid){
            url += "&vid="+ vid;
        }

        this.loadmask = new metaScore.overlay.LoadMask({
            'parent': this,
            'autoShow': true
        });
        
        this.unloadPlayer();
        
        this.player_frame = new metaScore.Dom('<iframe/>', {'src': url, 'class': 'player-frame'}).appendTo(this.workspace)
            .addListener('load', metaScore.Function.proxy(this.onPlayerFrameLoadSuccess, this))
            .addListener('error', metaScore.Function.proxy(this.onPlayerFrameLoadError, this));

        return this;
    };

    /**
     * Unload the player
     *
     * @method unloadPlayer
     * @chainable
     */
    Editor.prototype.unloadPlayer = function(){
        delete this.player;
        
        this.player_contextmenu.disable();
        
        if(this.player_frame){
            this.player_frame.remove();                
            delete this.player_frame;
        }
        
        this.panels.block.unsetComponent();
        this.history.clear();
        this.setDirty(false)
            .updateMainmenu();

        return this;
    };
    
    /**
     * Add a component to the player
     *
     * @method addPlayerComponent
     * @private
     * @param {String} type The component's type
     * @param {Object} configs Configs to pass to the component
     * @param {Mixed} parent The component's parent
     * @chainable 
     */
    Editor.prototype.addPlayerComponent = function(type, configs, parent){
        var panel, component,
            page_configs,
            index, previous_page, start_time, end_time;
        
        switch(type){
            case 'element':
                panel = this.panels.element;
                component = parent.addElement(metaScore.Object.extend({'name': metaScore.Locale.t('editor.onElementPanelToolbarClick.defaultElementName', 'untitled')}, configs));

                panel.setComponent(component);

                this.history.add({
                    'undo': function(){
                        panel.unsetComponent();
                        component.remove();
                    },
                    'redo': function(){
                        parent.addElement(component);
                        panel.setComponent(component);
                    }
                });
                break;
                
            case 'page':
                panel = this.panels.page;
                
                if(parent.getProperty('synched')){
                    index = parent.getActivePageIndex();
                    previous_page = parent.getPage(index);

                    start_time = this.getPlayer().getMedia().getTime();
                    end_time = previous_page.getProperty('end-time');

                    configs['start-time'] = start_time;
                    configs['end-time'] = end_time;
                }

                component = parent.addPage(configs, index+1);
                panel.setComponent(component);

                this.history.add({
                    'undo': function(){
                        panel.unsetComponent();
                        parent.removePage(component);
                        parent.setActivePage(index);
                    },
                    'redo': function(){
                        parent.addPage(component, index+1);
                        panel.setComponent(component);
                    }
                });
                break;
                
            case 'block':
                panel = this.panels.block;
                component = parent.addBlock(metaScore.Object.extend({'name': metaScore.Locale.t('editor.onBlockPanelToolbarClick.defaultBlockName', 'untitled')}, configs));

                page_configs = {};

                if(component.getProperty('synched')){
                    page_configs['start-time'] = 0;
                    page_configs['end-time'] = parent.getMedia().getDuration();
                }

                component.addPage(page_configs);

                panel.setComponent(component);

                this.history.add({
                    'undo': function(){
                        panel.unsetComponent();
                        component.remove();
                    },
                    'redo': function(){
                        parent.addBlock(component);
                        panel.setComponent(component);
                    }
                });
                break;
                
            case 'block-toggler':
                panel = this.panels.block;
                component = parent.addBlockToggler(metaScore.Object.extend({'name': metaScore.Locale.t('editor.onBlockPanelToolbarClick.defaultBlockTogglerName', 'untitled')}, configs));

                panel.setComponent(component);

                this.history.add({
                    'undo': function(){
                        panel.unsetComponent();
                        component.remove();
                    },
                    'redo': function(){
                        parent.addBlockToggler(component);
                        panel.setComponent(component);
                    }
                });
                break;
        }
        
        this.player_frame.focus();
        
        return this;
    };
    
    /**
     * Remove a component from the player
     *
     * @method deletePlayerComponent
     * @private
     * @param {player.Component} component The component
     * @chainable 
     */
    Editor.prototype.deletePlayerComponent = function(component, confirm){
        var editor = this,
            player = this.getPlayer(),
            panel, block, page,
            index, configs, auto_page,
            type, alert_msg;
            
        if(component.instanceOf('Block') || component.instanceOf('BlockToggler')){
            type = 'block';
        }
        else if(component.instanceOf('Page')){
            type = 'page';
        }
        else if(component.instanceOf('Element')){
            type = 'element';
        }
            
        if(type && (confirm === true)){
            switch(type){
                case 'block':
                    alert_msg = metaScore.Locale.t('editor.deletePlayerComponent.block.msg', 'Are you sure you want to delete the block <em>@name</em>?', {'@name': component.getName()});
                    break;
                    
                case 'page':
                    block = component.getBlock();
                    alert_msg = metaScore.Locale.t('editor.deletePlayerComponent.page.msg', 'Are you sure you want to delete page @index of <em>@block</em>?', {'@index': block.getPageIndex(component) + 1, '@block': block.getName()});
                    break;
                    
                case 'element':
                    alert_msg = metaScore.Locale.t('editor.deletePlayerComponent.element.msg', 'Are you sure you want to delete the element <em>@name</em>?', {'@name': component.getName()});
                    break;
            }
            
            new metaScore.overlay.Alert({
                'parent': this,
                'text': alert_msg,
                'buttons': {
                    'confirm': metaScore.Locale.t('editor.deletePlayerComponent.yes', 'Yes'),
                    'cancel': metaScore.Locale.t('editor.deletePlayerComponent.no', 'No')
                },
                'autoShow': true
            })
            .addClass('delete-player-component')
            .addListener('buttonclick', function(evt){
                if(evt.detail.action === 'confirm'){
                    editor.deletePlayerComponent(component, false);
                }
            });
        }
        else{
            switch(type){
                case 'block':
                    panel = this.panels.block;
                    
                    if(panel.getComponent() === component){
                        panel.unsetComponent();
                    }
                    
                    component.remove();
         
                    this.history.add({
                        'undo': function(){
                            if(component.instanceOf('BlockToggler')){
                                player.addBlockToggler(component);
                            }
                            else{
                                player.addBlock(component);
                            }
                            panel.setComponent(component);
                        },
                        'redo': function(){
                            panel.unsetComponent();
                            component.remove();
                        }
                    });

                    if(!component.instanceOf('BlockToggler')){
                        player.updateBlockTogglers();
                    }
                    break;
                    
                case 'page':
                    panel = this.panels.page;
                    block = component.getBlock();
                    index = block.getActivePageIndex();

                    panel.unsetComponent();
                    block.removePage(component);

                    if(block.getPageCount() < 1){
                        configs = {};

                        if(block.getProperty('synched')){
                            configs['start-time'] = 0;
                            configs['end-time'] = player.getMedia().getDuration();
                        }

                        auto_page = block.addPage(configs);
                        panel.setComponent(auto_page);
                    }

                    block.setActivePage(Math.max(0, index-1));

                    this.history.add({
                        'undo': function(){
                            if(auto_page){
                                block.removePage(auto_page, true);
                            }

                            block.addPage(component, index);
                            panel.setComponent(component);
                        },
                        'redo': function(){
                            panel.unsetComponent();
                            block.removePage(component, true);

                            if(auto_page){
                                block.addPage(auto_page);
                                panel.setComponent(auto_page);
                            }

                            block.setActivePage(index-1);
                        }
                    });
                    break;
                
                case 'element':
                    panel = this.panels.element;
                    page = component.getPage();
                
                    if(panel.getComponent() === component){
                        panel.unsetComponent();
                    }
                    
                    component.remove();
         
                    this.history.add({
                        'undo': function(){
                            page.addElement(component);
                            panel.setComponent(component);
                        },
                        'redo': function(){
                            panel.unsetComponent();
                            component.remove();
                        }
                    });
                    break;
            }
        
            this.player_frame.focus();
        }
        
        return this;
    };

    /**
     * Opens the guide selector
     *
     * @method openGuideSelector
     * @chainable
     */
    Editor.prototype.openGuideSelector = function(){
        new metaScore.editor.overlay.GuideSelector({
                'url': this.configs.api_url +'guide.json',
                'autoShow': true
            })
            .addListener('submit', metaScore.Function.proxy(this.onGuideSelectorSubmit, this));

        return this;
    };

    /**
     * Creates a new guide
     *
     * @method createGuide
     * @private
     * @param {Object} details The guide's data
     * @param {GuideDetails} overlay The overlay instance used to create the guide
     * @chainable
     */
    Editor.prototype.createGuide = function(details, overlay){
        var data = new FormData(),
            options;

        // append values from the details overlay
        metaScore.Object.each(details, function(key, value){
            if(key === 'thumbnail' || key === 'media'){
                data.append('files['+ key +']', value.object);
            }
            else{
                data.append(key, value);
            }
        });

        // prepare the Ajax options object
        options = metaScore.Object.extend({
            'data': data,
            'dataType': 'json',
            'success': metaScore.Function.proxy(this.onGuideCreateSuccess, this, [overlay]),
            'error': metaScore.Function.proxy(this.onXHRError, this)
        }, this.configs.ajax);

        // add a loading mask
        this.loadmask = new metaScore.overlay.LoadMask({
            'parent': this,
            'text': metaScore.Locale.t('editor.createGuide.LoadMask.text', 'Saving...'),
            'autoShow': true
        });

        metaScore.Ajax.post(this.configs.api_url +'guide.json', options);

        return this;
    };

    /**
     * Saves the loaded guide
     *
     * @method saveGuide
     * @param {String} action The action to perform when saving ('update' or 'clone')
     * @param {Boolean} publish Whether to published the new revision
     * @chainable
     */
    Editor.prototype.saveGuide = function(action, publish){
        var player = this.getPlayer(),
            id = player.getId(),
            vid = player.getRevision(),
            components = player.getComponents('.media, .controller, .block, .block-toggler'),
            data = new FormData(),
            details = this.detailsOverlay.getValues(),
            blocks = [],
            component, options;

        // append the publish flag if true
        if(publish === true){
            data.append('publish', true);
        }

        // append values from the details overlay
        metaScore.Object.each(details, function(key, value){
            if(key === 'thumbnail' || key === 'media'){
                data.append('files['+ key +']', value.object);
            }
            else if(metaScore.Var.is(value, 'array')){
                metaScore.Array.each(value, function(index, val){
                    data.append(key +'[]', val);
                });
            }
            else{
                data.append(key, value);
            }
        });

        // append blocks data
        components.each(function(index, dom){
            component = dom._metaScore;

            if(component.instanceOf('Media')){
                data.append('blocks[]', JSON.stringify(metaScore.Object.extend({'type': 'media'}, component.getProperties())));
            }
            else if(component.instanceOf('Controller')){
                data.append('blocks[]', JSON.stringify(metaScore.Object.extend({'type': 'controller'}, component.getProperties())));
            }
            else if(component.instanceOf('BlockToggler')){
                data.append('blocks[]', JSON.stringify(metaScore.Object.extend({'type': 'block-toggler'}, component.getProperties())));
            }
            else if(component.instanceOf('Block')){
                data.append('blocks[]', JSON.stringify(metaScore.Object.extend({'type': 'block'}, component.getProperties())));
            }
        }, this);

        // prepare the Ajax options object
        options = metaScore.Object.extend({
            'data': data,
            'dataType': 'json',
            'success': metaScore.Function.proxy(this.onGuideSaveSuccess, this),
            'error': metaScore.Function.proxy(this.onXHRError, this)
        }, this.configs.ajax);

        // add a loading mask
        this.loadmask = new metaScore.overlay.LoadMask({
            'parent': this,
            'text': metaScore.Locale.t('editor.saveGuide.LoadMask.text', 'Saving...'),
            'autoShow': true
        });

        metaScore.Ajax.post(this.configs.api_url +'guide/'+ id +'/'+ action +'.json?vid='+ vid, options);

        return this;
    };

    /**
     * Get a media file's duration in centiseconds
     *
     * @method getMediaFileDuration
     * @private
     * @param {String} url The file's url
     * @param {Function} callback A callback function to call with the duration
     */
    Editor.prototype.getMediaFileDuration = function(url, callback){
        var media = new metaScore.Dom('<audio/>', {'src': url})
            .addListener('loadedmetadata', function(evt){
                var duration = Math.round(parseFloat(media.get(0).duration) * 100);

                callback(duration);
            });
    };

    return Editor;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor').DropDownMenu = (function () {

    /**
     * A dropdown menu based on an HTML ul element
     *
     * @class DropDownMenu
     * @namespace editor
     * @extends Dom
     * @constructor
     */
    function DropDownMenu() {
        // call the super constructor.
        metaScore.Dom.call(this, '<ul/>', {'class': 'dropdown-menu'});
    }

    metaScore.Dom.extend(DropDownMenu);

    /**
     * Add an item
     *
     * @method addItem
     * @param {String} action The action associated with the item
     * @param {String} label The text to display
     * @return {Dom} item The added item
     */
    DropDownMenu.prototype.addItem = function(action, label){
        var item = new metaScore.Dom('<li/>', {'data-action': action, 'text': label})
            .appendTo(this);

        return item;
    };

    /**
     * Toggle an item's enabled state
     *
     * @method toggleItem
     * @param {String} action The action associated with the item
     * @param {Boolean} [state] The state to set the item to, the current state is toggled if not provided
     * @chainable
     */
    DropDownMenu.prototype.toggleItem = function(action, state){
        this.child('[data-action="'+ action +'"]').toggleClass('disabled', state === false);

        return this;
    };

    return DropDownMenu;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor').Field = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * Fired when the field is reset
     *
     * @event reset
     * @param {Object} field The field instance
     */
    var EVT_RESET = 'reset';

    /**
     * A generic field based on an HTML input element
     *
     * @class Field
     * @namespace editor
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Mixed} [configs.value=null] The default value
     * @param {Boolean} [configs.required=false] Whether the field is required
     * @param {Boolean} [configs.disabled=false] Whether the field is disabled by default
     * @param {Boolean} [configs.readonly=false] Whether the field is readonly by default
     * @param {String} [configs.description=''] A description to add to the field
     */
    function Field(configs) {
        this.configs = this.getConfigs(configs);

        // call the super constructor.
        metaScore.Dom.call(this, '<div/>', {'class': 'field'});

        this.setupUI();

        // keep a reference to this class instance in the DOM node
        this.get(0)._metaScore = this;

        if(this.input){
            if(this.configs.name){
                this.input.attr('name', this.configs.name);
            }

            if(this.configs.required){
                this.addClass('required');
                this.input.attr('required', '');
            }
        }

        if(this.configs.description){
            this.setDescription(this.configs.description);
        }
        
        this.reset(true);
    }

    Field.defaults = {
        'value': null,
        'required': false,
        'disabled': false,
        'readonly': false,
        'description': null
    };

    metaScore.Dom.extend(Field);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    Field.prototype.setupUI = function(){
        var uid = 'field-'+ metaScore.String.uuid(5);

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new metaScore.Dom('<input/>', {'id': uid})
            .addListener('change', metaScore.Function.proxy(this.onChange, this))
            .appendTo(this.input_wrapper);
    };

    /**
     * Set the description text
     *
     * @method setDescription
     * @param {String} description The description text
     * @chainable
     */
    Field.prototype.setDescription = function(description){
        if(!('description' in this)){
            this.description = new metaScore.Dom('<div/>', {'class': 'description'})
                .appendTo(this.input_wrapper);
        }

        this.description.text(description);
        
        return this;
    };

    /**
     * The change event handler
     *
     * @method onChange
     * @param {Event} evt The event object
     * @private
     */
    Field.prototype.onChange = function(evt){
        this.value = this.input.val();

        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    };

    /**
     * Set the field's value
     *
     * @method setValue
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    Field.prototype.setValue = function(value, supressEvent){
        this.input.val(value);
        this.value = value;

        if(supressEvent !== true){
            this.input.triggerEvent('change');
        }
        
        return this;
    };

    /**
     * Get the field's current value
     *
     * @method getValue
     * @return {Mixed} The value
     */
    Field.prototype.getValue = function(){
        return this.value;
    };

    /**
     * Disable the field
     *
     * @method disable
     * @chainable
     */
    Field.prototype.disable = function(){
        this.disabled = true;

        this.addClass('disabled');

        if(this.input){
            this.input.attr('disabled', 'disabled');
        }

        return this;
    };

    /**
     * Enable the field
     *
     * @method enable
     * @chainable
     */
    Field.prototype.enable = function(){
        this.disabled = false;

        this.removeClass('disabled');

        if(this.input){
            this.input.attr('disabled', null);
        }

        return this;
    };

    /**
     * Toggle the field's readonly state
     *
     * @method readonly
     * @param {Boolean} [readonly] Whether the field should be readonly, the current state is toggled if not provided
     * @chainable
     */
    Field.prototype.readonly = function(readonly){
        this.is_readonly = readonly === true;

        this.toggleClass('readonly', this.is_readonly);

        if(this.input){
            this.input.attr('readonly', this.is_readonly ? "readonly" : null);
        }

        return this;
    };
    
    /**
     * Reset the field's configs
     *
     * @method reset
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    Field.prototype.reset = function(supressEvent){
        this.setValue(this.configs.value);

        if(this.configs.disabled){
            this.disable();
        }
        else{
            this.enable();
        }

        this.readonly(this.configs.readonly);

        if(supressEvent !== true){
            this.triggerEvent(EVT_RESET, {'field': this}, true, false);
        }

        return this;
    };

    return Field;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor').Fieldset = (function () {

    /**
     * A collapsible fieldset
     *
     * @todo replace with the HTML5 details tag when support reaches IE
     *
     * @class Fieldset
     * @namespace editor
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.legend_text=null] The text to use for the fieldset's legend
     * @param {Boolean} [configs.collapsible=false] Whether or not the fieldset can be collapsed
     * @param {Boolean} [configs.collapsed=false] Whether or not the fieldset is collapsed by default
     */
    function Fieldset(configs) {
        this.configs = this.getConfigs(configs);

        // call the super constructor.
        metaScore.Dom.call(this, '<fieldset/>');

        this.setupUI();
        
    }

    Fieldset.defaults = {
        'legend_text': null,
        'collapsible': false,
        'collapsed': false
    };

    metaScore.Dom.extend(Fieldset);

    /**
     * Setup the fieldset's UI
     *
     * @method setupUI
     * @private
     */
    Fieldset.prototype.setupUI = function(){
        var uid = 'fieldset-'+ metaScore.String.uuid(5);
        
        this.attr('id', uid);

        this.legend = new metaScore.Dom('<legend/>', {'text': this.configs.legend_text})
            .appendTo(this);

        this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
            .appendTo(this);
            
        if(this.configs.collapsible){
            this.addClass('collapsible');
            
            if(this.configs.collapsed){
                this.toggle(true);
            }
            
            this.legend.addListener('click', this.onLegendClick.bind(this));
        }
    };

    /**
     * The legend's click handler
     *
     * @method onLegendClick
     * @private
     * @param {Event} evt The event object
     */
    Fieldset.prototype.onLegendClick = function(evt){
        this.toggle();
    };

    /**
     * Toggle the fieldset's collapsed state
     *
     * @method toggle
     * @param {Boolean} [collapse] Whether to collapse or expand the fieldset. The state is toggled if not specified
     * @chainable
     */
    Fieldset.prototype.toggle = function(collapse){
        this.toggleClass('collapsed', collapse);
        
        return this;
    };

    /**
     * Get the fieldset's contents
     *
     * @method getContents
     * @return {Dom} The contents
     */
    Fieldset.prototype.getContents = function(){        
        return this.contents;
    };

    return Fieldset;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor').History = (function(){

    /**
     * Fired when a command is added
     *
     * @event add
     * @param {Object} command The added command
     */
    var EVT_ADD = 'add';

    /**
     * Fired when a command is undone
     *
     * @event undo
     * @param {Object} command The added command
     */
    var EVT_UNDO = 'undo';

    /**
     * Fired when a command is redone
     *
     * @event redo
     * @param {Object} command The added command
     */
    var EVT_REDO = 'redo';

    /**
     * Fired when the command history is cleared
     *
     * @event clear
     */
    var EVT_CLEAR = 'clear';

    /**
     * An undo/redo manager
     *
     * @class History
     * @namespace editor
     * @extends Evented
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Integer} [configs.max_commands=30] The max number of commands to store
     */
    function History(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        History.parent.call(this);

        this.commands = [];
        this.index = -1;
        this.executing = false;
    }

    History.defaults = {
        'max_commands': 30
    };

    metaScore.Evented.extend(History);

    /**
     * Execute a command's action
     *
     * @method execute
     * @private
     * @param {Object} command The command object
     * @param {String} action The action ('undo' or 'redo') to execute
     * @chainable
     */
    History.prototype.execute = function(command, action) {
        if (command && (action in command)) {
            this.executing = true;
            command[action](command);
            this.executing = false;
        }

        return this;
    };

    /**
     * Add a command
     *
     * @method add
     * @param {Object} command The command object. It should contain an 'undo' and a 'redo' function
     * @chainable
     */
    History.prototype.add = function (command){
        if (this.executing) {
            return this;
        }

        // invalidate items higher on the stack
        this.commands.splice(this.index + 1, this.commands.length - this.index);

        // insert the new command
        this.commands.push(command);

        // remove old commands
        if(this.commands.length > this.configs.max_commands){
            this.commands = this.commands.slice(this.configs.max_commands * -1);
        }

        // update the index
        this.index = this.commands.length - 1;

        this.triggerEvent(EVT_ADD, {'command': command});

        return this;
    };

    /**
     * Execute the undo action of the current command
     *
     * @method undo
     * @chainable
     */
    History.prototype.undo = function() {
        var command = this.commands[this.index];

        if (!command) {
            return this;
        }

        // execute the command's undo
         this.execute(command, 'undo');

        // update the index
        this.index -= 1;

        this.triggerEvent(EVT_UNDO, {'command': command});

        return this;
    };

    /**
     * Execute the redo action of the previous command
     *
     * @method redo
     * @chainable
     */
    History.prototype.redo = function() {
        var command = this.commands[this.index + 1];

        if (!command) {
            return this;
        }

        // execute the command's redo
        this.execute(command, 'redo');

        // update the index
        this.index += 1;

        this.triggerEvent(EVT_REDO, {'command': command});

        return this;
    };

    /**
     * Remove all commands
     *
     * @method clear
     * @chainable
     */
    History.prototype.clear = function () {
        var length = this.commands.length;

        this.commands = [];
        this.index = -1;

        if(length > 0) {
            this.triggerEvent(EVT_CLEAR);
        }
        
        return this;

    };

    /**
     * Check if an undo action is available
     *
     * @method hasUndo
     * @return {Boolean} Whether an undo action is available
     */
    History.prototype.hasUndo = function(){
        return this.index !== -1;
    };

    /**
     * Check if a redo action is available
     *
     * @method hasRedo
     * @return {Boolean} Whether a redo action is available
     */
    History.prototype.hasRedo = function(){
        return this.index < (this.commands.length - 1);
    };

    return History;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor').MainMenu = (function(){

    /**
     * The editor's main menu
     *
     * @class MainMenu
     * @namespace editor
     * @extends Dom
     * @constructor
     */
    function MainMenu() {
        // call parent constructor
        MainMenu.parent.call(this, '<div/>', {'class': 'main-menu clearfix'});

        this.setupUI();
    }

    metaScore.Dom.extend(MainMenu);

    /**
     * Setup the menu's UI
     *
     * @method setupUI
     * @private
     */
    MainMenu.prototype.setupUI = function(){
        var btn_group, sub_menu;

        new metaScore.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.new', 'New')
            })
            .data('action', 'new')
            .appendTo(this);

        new metaScore.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.open', 'Open')
            })
            .data('action', 'open')
            .appendTo(this);

        new metaScore.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.edit', 'Edit')
            })
            .data('action', 'edit')
            .appendTo(this);

        btn_group = new metaScore.Dom('<div/>', {'class': 'button-group save'}).appendTo(this);

        sub_menu = new metaScore.Dom('<div/>', {'class': 'sub-menu'}).appendTo(btn_group);

        new metaScore.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.save', 'Save as draft')
            })
            .data('action', 'save')
            .appendTo(btn_group);

        new metaScore.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.clone', 'Save as copy')
            })
            .data('action', 'clone')
            .appendTo(sub_menu);

        new metaScore.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.publish', 'Save & Publish')
            })
            .data('action', 'publish')
            .appendTo(sub_menu);

        new metaScore.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.delete', 'Delete')
            })
            .data('action', 'delete')
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        new metaScore.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.share', 'Share')
            })
            .data('action', 'share')
            .appendTo(this);

        new metaScore.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.download', 'Download')
            })
            .data('action', 'download')
            .disable()
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        this.timefield = new metaScore.editor.field.Time()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.time', 'Time')
            })
            .addClass('time')
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        this.rindexfield = new metaScore.editor.field.Number({
                'min': 0,
                'max': 999
            })
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.r-index', 'Reading index')
            })
            .addClass('r-index')
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        new metaScore.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.edit-toggle', 'Toggle edit mode')
            })
            .data('action', 'edit-toggle')
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        new metaScore.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.revert', 'Revert')
            })
            .data('action', 'revert')
            .appendTo(this);

        new metaScore.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.undo', 'Undo')
            })
            .data('action', 'undo')
            .appendTo(this);

        new metaScore.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.redo', 'Redo')
            })
            .data('action', 'redo')
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .css('flex', '20')
            .appendTo(this);

        new metaScore.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.settings', 'Settings')
            })
            .data('action', 'settings')
            .disable()
            .appendTo(this);

        new metaScore.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.help', 'Help')
            })
            .data('action', 'help')
            .appendTo(this);

        new metaScore.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.account', 'My Account')
            })
            .data('action', 'account')
            .appendTo(this);

        new metaScore.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.logout', 'Logout')
            })
            .data('action', 'logout')
            .appendTo(this);

    };

    /**
     * Toogle a button's enabled state
     *
     * @method toggleButton
     * @param {String} action The button's associated action
     * @param {Boolean} state The state to set the button to, the current state is toggled if not provided
     * @chainable
     */
    MainMenu.prototype.toggleButton = function(action, state){
        this.find('[data-action="'+ action +'"]').toggleClass('disabled', state === false);

        return this;
    };

    return MainMenu;

})();
/** 
 * @module Editor
 */

metaScore.namespace('editor').Panel = (function(){

    /**
     * Fired before a component is set
     *
     * @event componentbeforeset
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTBEFORESET = 'componentbeforeset';

    /**
     * Fired when a component is set
     *
     * @event componentset
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTSET = 'componentset';

    /**
     * Fired before a component is unset
     *
     * @event componentbeforeunset
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTBEFOREUNSET = 'componentbeforeunset';

    /**
     * Fired when a component is unset
     *
     * @event componentunset
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTUNSET = 'componentunset';

    /**
     * Fired when a component's values change
     *
     * @event valueschange
     * @param {Object} component The component instance
     * @param {Object} old_values The component instance
     * @param {Object} new_values The component instance
     */
    var EVT_VALUESCHANGE = 'valueschange';

    /**
     * A generic panel class
     *
     * @class Panel
     * @namespace editor
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.toolbarConfigs={}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    function Panel(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Panel.parent.call(this, '<div/>', {'class': 'panel'});

        // fix event handlers scope
        this.onComponentPropChange = metaScore.Function.proxy(this.onComponentPropChange, this);
        this.onComponentDragStart = metaScore.Function.proxy(this.onComponentDragStart, this);
        this.onComponentDrag = metaScore.Function.proxy(this.onComponentDrag, this);
        this.onComponentDragEnd = metaScore.Function.proxy(this.onComponentDragEnd, this);
        this.onComponentResizeStart = metaScore.Function.proxy(this.onComponentResizeStart, this);
        this.onComponentResize = metaScore.Function.proxy(this.onComponentResize, this);
        this.onComponentResizeEnd = metaScore.Function.proxy(this.onComponentResizeEnd, this);

        this.toolbar = new metaScore.editor.panel.Toolbar(this.configs.toolbarConfigs)
            .addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onToolbarButtonClick, this))
            .appendTo(this);

        this.toolbar.getTitle()
            .addListener('click', metaScore.Function.proxy(this.toggleState, this));

        this.contents = new metaScore.Dom('<div/>', {'class': 'fields'})
            .appendTo(this);

        this
            .addDelegate('.fields .field', 'valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .addDelegate('.fields .imagefield', 'resize', metaScore.Function.proxy(this.onImageFieldResize, this))
            .unsetComponent();
    }

    Panel.defaults = {
        'toolbarConfigs': {}
    };

    metaScore.Dom.extend(Panel);

    /**
     * Setup the panel's fields
     *
     * @method setupFields
     * @private
     * @param {Object} properties The properties description object
     * @chainable
     */
    Panel.prototype.setupFields = function(properties){
        var configs, fieldType, field;

        this.fields = {};
        this.contents.empty();

        metaScore.Object.each(properties, function(key, prop){
            if(prop.editable !== false){
                configs = prop.configs || {};

                field = new metaScore.editor.field[prop.type](configs)
                    .data('name', key)
                    .appendTo(this.contents);

                this.fields[key] = field;
            }
        }, this);

        return this;
    };

    /**
     * Get the panel's toolbar
     *
     * @method getToolbar
     * @return {editor.panel.Toolbar} The toolbar
     */
    Panel.prototype.getToolbar = function(){
        return this.toolbar;
    };

    /**
     * Get a field by name
     *
     * @method getField
     * @param {String} name The name of the field to get
     * @return {editor.Field} The field
     */
    Panel.prototype.getField = function(name){
        if(name === undefined){
            return this.fields;
        }

        return this.fields[name];
    };

    /**
     * Enable all fields
     *
     * @method enableFields
     * @chainable
     */
    Panel.prototype.enableFields = function(){
        metaScore.Object.each(this.fields, function(key, field){
            field.enable();
        }, this);
        
        return this;
    };

    /**
     * Show a field by name
     *
     * @method showField
     * @param {String} name The name of the field to show
     * @chainable
     */
    Panel.prototype.showField = function(name){
        this.getField(name).show();

        return this;
    };

    /**
     * Hide a field by name
     *
     * @method hideField
     * @param {String} name The name of the field to show
     * @chainable
     */
    Panel.prototype.hideField = function(name){
        this.getField(name).hide();

        return this;
    };

    /**
     * Toggle the panel's collapsed state
     *
     * @method toggleState
     * @chainable
     */
    Panel.prototype.toggleState = function(){
        this.toggleClass('collapsed');

        return this;
    };

    /**
     * Disable the panel
     *
     * @method disable
     * @chainable
     */
    Panel.prototype.disable = function(){
        this.addClass('disabled');

        return this;
    };

    /**
     * Enable the panel
     *
     * @method enable
     * @chainable
     */
    Panel.prototype.enable = function(){
        this.removeClass('disabled');

        return this;
    };

    /**
     * Get the currently associated component
     *
     * @method getComponent
     * @return {player.Component} The component
     */
    Panel.prototype.getComponent = function(){
        return this.component;
    };

    /**
     * Get the currently associated component's label
     *
     * @method getSelectorLabel
     * @return {String} The component's label for use in the selector
     */
    Panel.prototype.getSelectorLabel = function(component){
        return component.getName();
    };

    /**
     * Set the associated component
     *
     * @method setComponent
     * @param {player.Component} component The component
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    Panel.prototype.setComponent = function(component, supressEvent){
        if(component !== this.getComponent()){
            if(!component){
                return this.unsetComponent();
            }

            this.unsetComponent(true);

            this.triggerEvent(EVT_COMPONENTBEFORESET, {'component': component}, false);

            this.component = component;

            this
                .setupFields(this.component.configs.properties)
                .updateFieldValues(this.getValues(Object.keys(this.getField())), true)
                .addClass('has-component');

            this.getToolbar().getSelector().setValue(component.getId(), true);

            if(!component.instanceOf('Controller') && !component.instanceOf('Media')){
                this.getToolbar().toggleMenuItem('delete', true);
            }

            component
                .addClass('selected')
                .addListener('propchange', this.onComponentPropChange)
                .addListener('dragstart', this.onComponentDragStart)
                .addListener('drag', this.onComponentDrag)
                .addListener('dragend', this.onComponentDragEnd)
                .addListener('resizestart', this.onComponentResizeStart)
                .addListener('resize', this.onComponentResize)
                .addListener('resizeend', this.onComponentResizeEnd);

            if(supressEvent !== true){
                this.triggerEvent(EVT_COMPONENTSET, {'component': component}, false);
            }
        }

        return this;
    };

    /**
     * Unset the associated component
     *
     * @method unsetComponent
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    Panel.prototype.unsetComponent = function(supressEvent){
        var component = this.getComponent(),
            toolbar = this.getToolbar();

        this.removeClass('has-component');
        toolbar.toggleMenuItem('delete', false);

        if(component){
            this.triggerEvent(EVT_COMPONENTBEFOREUNSET, {'component': component}, false);
        
            this
                .updateDraggable(false)
                .updateResizable(false);

            toolbar.getSelector().setValue(null, true);

            component
                .removeClass('selected')
                .removeListener('propchange', this.onComponentPropChange)
                .removeListener('dragstart', this.onComponentDragStart)
                .removeListener('drag', this.onComponentDrag)
                .removeListener('dragend', this.onComponentDragEnd)
                .removeListener('resizestart', this.onComponentResizeStart)
                .removeListener('resize', this.onComponentResize)
                .removeListener('resizeend', this.onComponentResizeEnd);

            delete this.component;

            if(supressEvent !== true){
                this.triggerEvent(EVT_COMPONENTUNSET, {'component': component}, false);
            }
        }

        return this;
    };

    /**
     * Set or unset the draggability of the associated component
     *
     * @method updateDraggable
     * @private
     * @param {Boolean} draggable Whether the component should be draggable
     * @chainable
     */
    Panel.prototype.updateDraggable = function(draggable){
        var component = this.getComponent();

        draggable = metaScore.Var.is(component.setDraggable, 'function') ? component.setDraggable(draggable) : false;

        this.toggleFields(['x', 'y'], draggable ? true : false);

        return this;
    };

    /**
     * Set or unset the resizability of the associated component
     *
     * @method updateResizable
     * @private
     * @param {Boolean} resizable Whether the component should be resizable
     * @chainable
     */
    Panel.prototype.updateResizable = function(resizable){
        var component = this.getComponent();

        resizable = metaScore.Var.is(component.setResizable, 'function') ? component.setResizable(resizable) : false;

        this.toggleFields(['width', 'height'], resizable ? true : false);

        return this;
    };

    /**
     * The toolbar buttons' click event handler
     *
     * @method onToolbarButtonClick
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onToolbarButtonClick = function(evt){
        var selector, options, count, index,
            action = metaScore.Dom.data(evt.target, 'action');

        switch(action){
            case 'previous':
                selector = this.getToolbar().getSelector();
                options = selector.find('option[value^="component"]');
                count = options.count();

                if(count > 0){
                    index = options.index(':checked') - 1;

                    if(index < 0){
                        index = count - 1;
                    }

                    selector.setValue(new metaScore.Dom(options.get(index)).val());
                }

                evt.stopPropagation();
                break;

            case 'next':
                selector = this.getToolbar().getSelector();
                options = selector.find('option[value^="component"]');
                count = options.count();

                if(count > 0){
                    index = options.index(':checked') + 1;

                    if(index >= count){
                        index = 0;
                    }

                    selector.setValue(new metaScore.Dom(options.get(index)).val());
                }

                evt.stopPropagation();
                break;
        }
    };

    /**
     * The component's propchange event handler
     *
     * @method onComponentPropChange
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentPropChange = function(evt){           
        if(evt.detail.component !== this.getComponent()){
            return;
        }
        
        this.updateFieldValue(evt.detail.property, evt.detail.value, true);
    };

    /**
     * The component's dragstart event handler
     *
     * @method onComponentDragStart
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentDragStart = function(evt){
        this._beforeDragValues = this.getValues(['x', 'y']);
    };

    /**
     * The component's drag event handler
     *
     * @method onComponentDrag
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentDrag = function(evt){
        this.updateFieldValues(['x', 'y'], true);
    };

    /**
     * The component's dragend event handler
     *
     * @method onComponentDragEnd
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentDragEnd = function(evt){
        var component = this.getComponent(),
            fields = ['x', 'y'];

        this.updateFieldValues(fields, true);

        this.triggerEvent(EVT_VALUESCHANGE, {'component': component, 'old_values': this._beforeDragValues, 'new_values': this.getValues(fields)}, false);

        delete this._beforeDragValues;
    };

    /**
     * The component's resizestart event handler
     *
     * @method onComponentResizeStart
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentResizeStart = function(evt){
        var fields = ['x', 'y', 'width', 'height'];

        this._beforeResizeValues = this.getValues(fields);
    };

    /**
     * The component's resize event handler
     *
     * @method onComponentResize
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentResize = function(evt){
        var fields = ['x', 'y', 'width', 'height'];

        this.updateFieldValues(fields, true);
    };

    /**
     * The component's resizeend event handler
     *
     * @method onComponentResizeEnd
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentResizeEnd = function(evt){
        var component = this.getComponent(),
            fields = ['x', 'y', 'width', 'height'];

        this.updateFieldValues(fields, true);

        this.triggerEvent(EVT_VALUESCHANGE, {'component': component, 'old_values': this._beforeResizeValues, 'new_values': this.getValues(fields)}, false);

        delete this._beforeResizeValues;
    };

    /**
     * The fields' valuechange event handler
     *
     * @method onFieldValueChange
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onFieldValueChange = function(evt){
        var component = this.getComponent(),
            name, value, old_values;

        if(!component){
            return;
        }

        name = evt.detail.field.data('name');
        value = evt.detail.value;
        old_values = this.getValues([name]);

        component.setProperty(name, value);

        this.triggerEvent(EVT_VALUESCHANGE, {'component': component, 'old_values': old_values, 'new_values': this.getValues([name])}, false);
    };

    /**
     * The imagefields' resize event handler
     *
     * @method onImageFieldResize
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onImageFieldResize = function(evt){
        var panel = this,
            component, old_values, img;
        
        if(evt.detail.value){
            component = this.getComponent();
            
            if(!component.getProperty('locked')){
                old_values = this.getValues(['width', 'height']);
                
                img = new metaScore.Dom('<img/>')
                    .addListener('load', function(evt){
                        panel.updateProperties(component, {'width': evt.target.width, 'height': evt.target.height});
                        panel.triggerEvent(EVT_VALUESCHANGE, {'component': component, 'old_values': old_values, 'new_values': panel.getValues(['width', 'height'])}, false);
                    })
                    .attr('src', evt.detail.value);
            }
        }
    };

    /**
     * Update a field's value
     *
     * @method updateFieldValue
     * @param {String} name The field's name
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     *
     * @todo add the synched/non synched strings to blocks (see Editor.updateBlockSelector)
     */
    Panel.prototype.updateFieldValue = function(name, value, supressEvent){
        var component;
        
        this.getField(name).setValue(value, supressEvent);

        switch(name){
            case 'locked':
                this.toggleClass('locked', value);
                this.updateDraggable(!value);
                this.updateResizable(!value);
                break;

            case 'name':
                component = this.getComponent();
                this.getToolbar().getSelector().updateOption(component.getId(), this.getSelectorLabel(component));
                break;

            case 'start-time':
                this.getField('end-time').setMin(value);
                break;

            case 'end-time':
                this.getField('start-time').setMax(value);
                break;
        }

        return this;
    };

    /**
     * Update fields' values
     *
     * @method updateFieldValues
     * @param {Object} values A list of values with the field names as keys
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    Panel.prototype.updateFieldValues = function(values, supressEvent){
        if(metaScore.Var.is(values, 'array')){
            metaScore.Array.each(values, function(index, field){
                this.updateFieldValue(field, this.getValue(field), supressEvent);
            }, this);
        }
        else{
            metaScore.Object.each(values, function(field, value){
                this.updateFieldValue(field, value, supressEvent);
            }, this);
        }

        return this;
    };

    /**
     * Update a component's properties
     *
     * @method updateProperties
     * @param {player.Component} component The component to update
     * @param {Object} values A list of values with the property names as keys
     * @chainable
     */
    Panel.prototype.updateProperties = function(component, values){
        metaScore.Object.each(values, function(name, value){
            if(!this.getField(name).disabled){
                component.setProperty(name, value);
            }
        }, this);

        this.updateFieldValues(values, true);

        return this;
    };

    /**
     * Toggle the enabled state of some fields
     *
     * @method toggleFields
     * @param {Array} names The list of field names to toggle
     * @param {Boolean} toggle Whether the fields are to be enabled or disabled
     * @chainable
     */
    Panel.prototype.toggleFields = function(names, toggle){
        var field;

        metaScore.Array.each(names, function(index, name){
            if(field = this.getField(name)){
                if(toggle){
                    field.enable();
                }
                else{
                    field.disable();
                }
            }
        }, this);

        return this;
    };

    /**
     * Get the associated component's property value
     *
     * @method getValue
     * @param {String} name The propoerty's name
     * @return {Mixed} The value
     */
    Panel.prototype.getValue = function(name){
        return this.getComponent().getProperty(name);
    };

    /**
     * Get the associated component's properties values
     *
     * @method getValues
     * @param {Array} [names] The names of properties, if not set, the panel's field names are used
     * @return {Object} A list of values keyed by property name
     */
    Panel.prototype.getValues = function(names){
        var values = {};

        names = names || Object.keys(this.getField());

        metaScore.Array.each(names, function(index, name){
            if(!this.getField(name).disabled){
                values[name] = this.getValue(name);
            }
        }, this);

        return values;
    };

    return Panel;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').BorderRadius = (function () {

    /**
     * A complex field for defining CSS border radius values
     * 
     * @class BorderRadius
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     */
    function BorderRadiusrField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        BorderRadiusrField.parent.call(this, this.configs);

        this.addClass('borderradiusrfield');
    }

    metaScore.editor.Field.extend(BorderRadiusrField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    BorderRadiusrField.prototype.setupUI = function(){
        var buttons;
        
        BorderRadiusrField.parent.prototype.setupUI.call(this);

        this.input
            .attr('readonly', 'readonly')
            .addListener('click', metaScore.Function.proxy(this.onClick, this));
            
        buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .appendTo(this.input_wrapper);

        this.clear = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear'})
            .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
            .appendTo(buttons);

        this.overlay = new metaScore.editor.overlay.BorderRadius()
            .addListener('submit', metaScore.Function.proxy(this.onOverlaySubmit, this));
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    BorderRadiusrField.prototype.setValue = function(value, supressEvent){
        BorderRadiusrField.parent.prototype.setValue.call(this, value, supressEvent);

        this.input.attr('title', value);

        return this;
    };

    /**
     * The click event handler
     * 
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    BorderRadiusrField.prototype.onClick = function(evt){
        if(this.disabled){
            return;
        }

        this.overlay
            .setValue(this.value)
            .show();
    };

    /**
     * The overlay's submit event handler
     * 
     * @method onOverlaySubmit
     * @private
     * @param {Event} evt The event object
     */
    BorderRadiusrField.prototype.onOverlaySubmit = function(evt){
        var value = evt.detail.value,
            overlay = evt.detail.overlay;

        this.setValue(value);
    };

    /**
     * The clear button's click event handler
     * 
     * @method onClearClick
     * @private
     * @param {Event} evt The event object
     */
    BorderRadiusrField.prototype.onClearClick = function(evt){
        this.setValue('0px');
    };

    return BorderRadiusrField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Buttons = (function () {

    /**
     * Fired when a value is selected though a button click
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The clicked button's key
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * A simple buttons field based on HTML button elements
     *
     * @class ButtonsField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.buttons={}}] The list of buttons as name/attributes pairs
     */
    function ButtonsField(configs) {
        this.configs = this.getConfigs(configs);

        this.buttons = {};

        // fix event handlers scope
        this.onClick = metaScore.Function.proxy(this.onClick, this);

        // call parent constructor
        ButtonsField.parent.call(this, this.configs);

        this.addClass('buttonsfield');
    }

    ButtonsField.defaults = {
        'buttons': {}
    };

    metaScore.editor.Field.extend(ButtonsField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    ButtonsField.prototype.setupUI = function(){
        var field = this;

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        metaScore.Object.each(this.configs.buttons, function(name, attr){
            this.buttons[name] = new metaScore.Dom('<button/>', attr)
                .addListener('click', function(){
                    field.triggerEvent(EVT_VALUECHANGE, {'field': field, 'value': name}, true, false);
                })
                .appendTo(this.input_wrapper);
        }, this);
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @chainable
     */
    ButtonsField.prototype.setValue = function(){
        return this;
    };

    /**
     * Get the list of buttons
     * 
     * @method getButtons
     * @return {Object} The list of buttons as a name/Dom pair
     */
    ButtonsField.prototype.getButtons = function(){
        return this.buttons;
    };

    /**
     * Get a button by name
     * 
     * @method getButton
     * @param {String} name The button's name
     * @return {Dom} The button's Dom object
     */
    ButtonsField.prototype.getButton = function(name){
        return this.buttons[name];
    };

    return ButtonsField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Checkbox = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * A checkbox field based on an HTML input[type=checkbox] element
     *
     * @class Checkbox
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.checked=false] Whether the field is checked by default
     * @param {Boolean} [configs.checked_value=true] The value when checked
     * @param {Boolean} [configs.unchecked_value=false] The value when unchecked
     */
    function CheckboxField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        CheckboxField.parent.call(this, this.configs);

        this.addClass('checkboxfield');

        this.setValue(this.configs.checked ? this.configs.checked_value : this.configs.unchecked_value);
    }

    CheckboxField.defaults = {
        'checked': false,
        'checked_value': true,
        'unchecked_value': false
    };

    metaScore.editor.Field.extend(CheckboxField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    CheckboxField.prototype.setupUI = function(){
        var uid = 'field-'+ metaScore.String.uuid(5);

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new metaScore.Dom('<input/>', {'type': 'checkbox', 'id': uid})
            .addListener('click', metaScore.Function.proxy(this.onClick, this))
            .addListener('change', metaScore.Function.proxy(this.onChange, this))
            .appendTo(this.input_wrapper);
    };

    /**
     * The click event handler
     * 
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    CheckboxField.prototype.onClick = function(evt){
        if(this.is_readonly){
            evt.preventDefault();
        }
    };

    /**
     * The change event handler
     * 
     * @method onChange
     * @private
     * @param {Event} evt The event object
     */
    CheckboxField.prototype.onChange = function(evt){
        if(this.is_readonly){
            evt.preventDefault();
            return;
        }

        if(this.input.is(":checked")){
            this.value = this.configs.checked_value;
            this.addClass('checked');
        }
        else{
            this.value = this.configs.unchecked_value;
            this.removeClass('checked');
        }

        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    CheckboxField.prototype.setValue = function(value, supressEvent){
        this.input.get(0).checked = value === this.configs.checked_value;

        if(supressEvent !== true){
            this.input.triggerEvent('change');
        }

        return this;
    };

    return CheckboxField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Checkboxes = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * A select list field based on an HTML select element
     *
     * @class CheckboxesField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.options=[]] A list of select options as objects with 'value' and 'text' keys
     */
    function CheckboxesField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        CheckboxesField.parent.call(this, this.configs);

        this.addClass('checkboxesfield');
    }

    CheckboxesField.defaults = {
        'options': []
    };

    metaScore.editor.Field.extend(CheckboxesField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    CheckboxesField.prototype.setupUI = function(){
        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.checkboxes_wrapper = new metaScore.Dom('<div/>', {'class': 'checkboxes-wrapper'})
            .appendTo(this.input_wrapper);
        
        metaScore.Array.each(this.configs.options, function(index, option){
            this.addCheckbox(option.value, option.text);
        }, this);
    };

    /**
     * The click event handler
     * 
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    CheckboxesField.prototype.onClick = function(evt){
        if(this.is_readonly){
            evt.preventDefault();
        }
    };

    /**
     * The change event handler
     * 
     * @method onChange
     * @private
     * @param {Event} evt The event object
     */
    CheckboxesField.prototype.onChange = function(evt){
        if(this.is_readonly){
            evt.preventDefault();
            return;
        }
        
        this.value = [];
        
        this.checkboxes_wrapper.find('input').each(function(index, checkbox_el){
            var checkbox = new metaScore.Dom(checkbox_el);
            
            if(checkbox.is(":checked")){
                this.value.push(checkbox.val());
            }
        }, this);

        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Array} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    CheckboxesField.prototype.setValue = function(value, supressEvent){
        var arr_value = metaScore.Var.is(value, "array") ? value : [value];
        
        this.checkboxes_wrapper.find('input').each(function(index, checkbox_el){
            var checkbox = new metaScore.Dom(checkbox_el);
            
            checkbox_el.checked = metaScore.Array.inArray(checkbox.attr('value'), arr_value) >= 0;
            
            if(supressEvent !== true){
                checkbox.triggerEvent('change');
            }   
        }, this);

        return this;
    };

    /**
     * Add a checkbox to the list of checkboxes
     * 
     * @method addCheckbox
     * @param {String} value The option's value
     * @param {String} text The option's label
     * @return {Dom} The created Dom object
     */
    CheckboxesField.prototype.addCheckbox = function(value, text){
        var uid, checkbox_wrapper, label, checkbox;
        
        uid = 'checkbox-'+ metaScore.String.uuid(5);
        
        checkbox_wrapper = new metaScore.Dom('<div/>', {'class': 'checkbox-wrapper'})
            .appendTo(this.checkboxes_wrapper);
        
        checkbox = new metaScore.Dom('<input/>', {'id': uid, 'type': 'checkbox', 'value': value})
            .addListener('click', metaScore.Function.proxy(this.onClick, this))
            .addListener('change', metaScore.Function.proxy(this.onChange, this))
            .appendTo(checkbox_wrapper);

        label = new metaScore.Dom('<label/>', {'text': text, 'for': uid})
            .appendTo(checkbox_wrapper);
            
        if(this.configs.name){
            checkbox.attr('name', this.configs.name);
        }
            
        return checkbox;
    };

    /**
     * Remove a checkbox by value
     * 
     * @method removeCheckbox
     * @param {String} value The value of the option to remove
     * @return {Dom} The checkbox's Dom object
     */
    CheckboxesField.prototype.removeCheckbox = function(value){
        var checkbox = this.checkboxes_wrapper.find('input[value="'+ value +'"]');

        checkbox.parents().remove();

        return checkbox;
    };

    /**
     * Remove all groups and options
     * 
     * @method clear
     * @chainable
     */
    CheckboxesField.prototype.clear = function(){
        this.checkboxes_wrapper.empty();

        return this;
    };

    /**
     * Disable the field
     *
     * @method disable
     * @chainable
     */
    CheckboxesField.prototype.disable = function(){
        this.disabled = true;

        this.addClass('disabled');

        this.checkboxes_wrapper.find('input').attr('disabled', 'disabled');

        return this;
    };

    /**
     * Enable the field
     *
     * @method enable
     * @chainable
     */
    CheckboxesField.prototype.enable = function(){
        this.disabled = false;

        this.removeClass('disabled');

        this.checkboxes_wrapper.find('input').attr('disabled', null);

        return this;
    };

    /**
     * Toggle the readonly attribute of the field
     * 
     * @method readonly
     * @param {Boolean} [readonly] Whether the field should be readonly, the current state is toggled if not provided
     * @chainable
     */
    CheckboxesField.prototype.readonly = function(readonly){
        CheckboxesField.parent.prototype.readonly.apply(this, arguments);

        this.checkboxes_wrapper.find('input').attr('disabled', this.is_readonly ? "disabled" : null);

        return this;
    };

    return CheckboxesField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Color = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * A color selection field
     *
     * @class ColorField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Mixed} [configs.value={r:255, g:255, b:255, a:1}}] The default value (see {{#crossLink "Color/parse:method"}}Color.parse{{/crossLink}} for valid values)
     */
    function ColorField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        ColorField.parent.call(this, this.configs);

        this.addClass('colorfield');
    }

    ColorField.defaults = {
        value: {
            r: 255,
            g: 255,
            b: 255,
            a: 1
        }
    };

    metaScore.editor.Field.extend(ColorField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    ColorField.prototype.setupUI = function(){
        var buttons;
        
        ColorField.parent.prototype.setupUI.call(this);

        this.input
            .attr('readonly', 'readonly')
            .addListener('click', metaScore.Function.proxy(this.onClick, this));
            
        buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .appendTo(this.input_wrapper);

        new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear', 'title': metaScore.Locale.t('editor.field.Color.clear.tooltip', 'Clear value')})
            .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
            .appendTo(buttons);

        this.overlay = new metaScore.editor.overlay.ColorSelector()
            .addListener('submit', metaScore.Function.proxy(this.onOverlaySubmit, this));
    };

    /**
     * Set the field'S value
     * 
     * @method setValue
     * @param {Mixed} value The new color's value (see {{#crossLink "Color/parse:method"}}Color.parse{{/crossLink}} for valid values)
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    ColorField.prototype.setValue = function(value, supressEvent){
        var rgba;

        this.value = value ? metaScore.Color.parse(value) : null;

        rgba = this.value ? 'rgba('+ this.value.r +','+ this.value.g +','+ this.value.b +','+ this.value.a +')' : null;

        this.input
            .attr('title', rgba)
            .css('background-color', rgba);

        if(supressEvent !== true){
            this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
        }

        return this;

    };

    /**
     * The click event handler
     * 
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    ColorField.prototype.onClick = function(evt){
        if(this.disabled){
            return;
        }

        this.overlay
            .setValue(metaScore.Object.copy(this.value))
            .show();
    };

    /**
     * The overlay's submit event handler
     * 
     * @method onOverlaySubmit
     * @private
     * @param {Event} evt The event object
     */
    ColorField.prototype.onOverlaySubmit = function(evt){
        var value = evt.detail.value,
            overlay = evt.detail.overlay;

        this.setValue(value);
    };

    /**
     * The clear button click event handler
     * 
     * @method onClearClick
     * @private
     * @param {Event} evt The event object
     */
    ColorField.prototype.onClearClick = function(evt){
        this.setValue("transparent");
    };

    return ColorField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').File = (function () {

    /**
     * A file field based on an HTML input[type=file] element
     *
     * @class FileField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.accept=null] The list of accepted file types (see {{#crossLink "editor.field.FileField/setAcceptedTypes:method"}}{{/crossLink}})
     */
    function FileField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        FileField.parent.call(this, this.configs);

        if(this.configs.accept){
            this.setAcceptedTypes(this.configs.accept);
        }

        this.addClass('filefield');
    }

    FileField.defaults = {
        'accept': null
    };

    metaScore.editor.Field.extend(FileField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    FileField.prototype.setupUI = function(){
        FileField.parent.prototype.setupUI.call(this);

        this.input.attr('type', 'file');

        this.current = new metaScore.Dom('<div/>')
            .appendTo(this.input_wrapper);
    };

    /**
     * Set the accepted file types
     * 
     * @method setAcceptedTypes
     * @param {String} types A comma seperated list of accepted file types (ex: ".gif,.jpg,.png,.doc" or "audio/*,video/*,image/*")
     */
    FileField.prototype.setAcceptedTypes = function(types){
        this.input.attr('accept', types);
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Object} [value] The new value
     * @param {String} value.name The file's name
     * @param {String} [value.url] The file's url
     * @chainable
     */
    FileField.prototype.setValue = function(value){
        var info;

        this.current.empty();

        this.input.val('');

        if(value && ('name' in value)){
            info = new metaScore.Dom('<a/>', {'text': value.name})
                .attr('target', '_blank')
                .appendTo(this.current);

            if('url' in value){
                info.attr('href', value.url);
            }
            
            this.input.attr('required', null);
        }
        else if(this.configs.required){
            this.input.attr('required', '');
        }

        return this;
    };

    /**
     * Helper function to get a selected file from the HTML input field
     * 
     * @method getFile
     * @private
     * @param {Integer} [index] The index of the selected file, all files will be returned if not provided
     * @return {Mixed} The <a href="https://developer.mozilla.org/en-US/docs/Web/API/File" target="_blank">File</a> or <a href="https://developer.mozilla.org/en/docs/Web/API/FileList" target="_blank">FileList</a>
     */
    FileField.prototype.getFile = function(index){
        var files = this.input.get(0).files;

        if(index !== undefined){
            return files[index];
        }

        return files;
    };

    return FileField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Image = (function () {

    /**
     * Fired when the external filebrowser should be opened
     *
     * @event filebrowser
     * @param {Function} callback The callback to invoke once a file is selected throught the external file browser
     */
    var EVT_FILEBROWSER = 'filebrowser';

    /**
     * Fired when the resize button is clicked
     *
     * @event resize
     * @param {Object} field The field instance
     * @param {Mixed} value The field value
     */
    var EVT_RESIZE = 'resize';

    /**
     * An image field wich depends on an external file browser to function
     *
     * @class ImageField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.placeholder="Browse..."] A placeholder text
     * @param {Boolean} [configs.resizeButton=false] Whether to show the resize button
     */
    function ImageField(configs) {
        this.configs = this.getConfigs(configs);

        // fix event handlers scope
        this.onFileSelect = metaScore.Function.proxy(this.onFileSelect, this);

        // call parent constructor
        ImageField.parent.call(this, this.configs);

        this.addClass('imagefield');
    }

    ImageField.defaults = {
        'placeholder': metaScore.Locale.t('editor.field.Image.placeholder', 'Browse...')
    };

    metaScore.editor.Field.extend(ImageField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    ImageField.prototype.setupUI = function(){
        var buttons;
        
        ImageField.parent.prototype.setupUI.call(this);

        this.input
            .attr('readonly', 'readonly')
            .attr('placeholder', this.configs.placeholder)
            .addListener('click', metaScore.Function.proxy(this.onClick, this));
            
        buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .appendTo(this.input_wrapper);
            
        if(this.configs.resizeButton){
            this.resize = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'resize', 'title': metaScore.Locale.t('editor.field.Image.resize.tooltip', 'Adapt container size to image')})
                .addListener('click', metaScore.Function.proxy(this.onResizeClick, this))
                .appendTo(buttons);
        }

        new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear', 'title': metaScore.Locale.t('editor.field.Image.clear.tooltip', 'Clear value')})
            .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
            .appendTo(buttons);
    };

    /**
     * Set the field'S value
     * 
     * @method setValue
     * @param {String} value The image file's url
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    ImageField.prototype.setValue = function(value, supressEvent){
        ImageField.parent.prototype.setValue.call(this, value, supressEvent);

        this.input.attr('title', value);

        return this;
    };

    /**
     * The click event handler
     * 
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    ImageField.prototype.onClick = function(evt){
        if(this.disabled){
            return;
        }

        this.triggerEvent(EVT_FILEBROWSER, {'callback': this.onFileSelect}, true, false);
    };

    /**
     * The resize button click event handler
     * 
     * @method onResizeClick
     * @private
     * @param {Event} evt The event object
     */
    ImageField.prototype.onResizeClick = function(evt){
        this.triggerEvent(EVT_RESIZE, {'field': this, 'value': this.value}, true, false);
    };

    /**
     * The clear button click event handler
     * 
     * @method onClearClick
     * @private
     * @param {Event} evt The event object
     */
    ImageField.prototype.onClearClick = function(evt){
        this.setValue(null);
    };

    /**
     * The file select event handler
     * 
     * @method onFileSelect
     * @private
     * @param {String} url The image file's url
     */
    ImageField.prototype.onFileSelect = function(url){
        this.setValue(url);
    };

    return ImageField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Number = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * A number field based on an HTML input[type=number] element
     *
     * @class NumberField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Number} [configs.value=0] The default value
     * @param {Number} [configs.min=null] The minimum allowed value
     * @param {Number} [configs.max=null] The maximum allowed value
     * @param {Number} [configs.step=1] The spin up/down step amount
     * @param {Boolean} [configs.spinButtons=true] Whether to show the spin buttons
     * @param {Integer} [configs.spinInterval=200] The speed of the spin buttons
     * @param {String} [configs.spinDirection='horizontal'] The direction of the spin buttons
     * @param {Boolean} [configs.flipSpinButtons=false] Whether to flip the spin buttons
     */
    function NumberField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        NumberField.parent.call(this, this.configs);
        
        this.spinDown = metaScore.Function.proxy(this.spinDown, this);
        this.spinUp = metaScore.Function.proxy(this.spinUp, this);

        this.addClass('numberfield');
    }

    NumberField.defaults = {
        'value': 0,
        'min': null,
        'max': null,
        'step': 1,
        'spinButtons': true,
        'spinInterval': 200,
        'spinDirection': 'horizontal',
        'flipSpinButtons': false
    };

    metaScore.editor.Field.extend(NumberField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    NumberField.prototype.setupUI = function(){
        var uid = 'field-'+ metaScore.String.uuid(5),
            buttons;

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new metaScore.Dom('<input/>', {'type': 'text', 'id': uid})
            .addListener('input', metaScore.Function.proxy(this.onInput, this))
            .addListener('mousewheel', metaScore.Function.proxy(this.onMouseWheel, this))
            .addListener('DOMMouseScroll', metaScore.Function.proxy(this.onMouseWheel, this))
            .addListener('keydown', metaScore.Function.proxy(this.onKeyDown, this))
            .appendTo(this.input_wrapper);

        if(this.configs.spinButtons){
            buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
                .appendTo(this.input_wrapper);
                
            if(this.configs.flipSpinButtons){
                buttons.addClass('flip');
            }
                
            this.spindown_btn = new metaScore.Dom('<button/>', {'text': '-', 'data-action': 'spin-down'})
                .addListener('mousedown', metaScore.Function.proxy(this.onSpinBtnMouseDown, this))
                .addListener('mouseup', metaScore.Function.proxy(this.onSpinBtnMouseUp, this))
                .addListener('mouseout', metaScore.Function.proxy(this.onSpinBtnMouseOut, this))
                .appendTo(buttons);
                
            this.spinup_btn = new metaScore.Dom('<button/>', {'text': '+', 'data-action': 'spin-up'})
                .addListener('mousedown', metaScore.Function.proxy(this.onSpinBtnMouseDown, this))
                .addListener('mouseup', metaScore.Function.proxy(this.onSpinBtnMouseUp, this))
                .addListener('mouseout', metaScore.Function.proxy(this.onSpinBtnMouseOut, this))
                .appendTo(buttons);
        }
        
        this.addClass(this.configs.spinDirection === 'vertical' ? 'vertical' : 'horizontal');

        this.addListener('change', metaScore.Function.proxy(this.onChange, this));
    };

    /**
     * The change event handler
     * 
     * @method onChange
     * @private
     * @param {Event} evt The event object
     */
    NumberField.prototype.onChange = function(evt){
        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    };

    /**
     * The input event handler
     * 
     * @method onInput
     * @private
     * @param {Event} evt The event object
     */
    NumberField.prototype.onInput = function(evt){
        this.setValue(this.input.val());
        
        evt.stopPropagation();
    };

    /**
     * The mousewheel event handler
     * 
     * @method onMouseWheel
     * @private
     * @param {Event} evt The event object
     */
    NumberField.prototype.onMouseWheel = function(evt){
        var delta, decimals, value;
        
        if(this.input.is(':focus')){
            delta = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail)));
            
            value = this.getValue() + (this.configs.step * delta);
            
            // work around the well-known floating point issue
            decimals = metaScore.Number.getDecimalPlaces(this.configs.step); 
            value = parseFloat(value.toFixed(decimals));
            
            this.setValue(value);
        
            evt.preventDefault();
        }
    };

    /**
     * The keydown event handler
     * 
     * @method onKeyDown
     * @private
     * @param {Event} evt The event object
     */
    NumberField.prototype.onKeyDown = function(evt){
        switch(evt.keyCode){
            case 38:
                this.spinUp();
                evt.preventDefault();
                break;
                
            case 40:
                this.spinDown();
                evt.preventDefault();
                break;
        }
    };

    /**
     * The spin button's mousedown event handler
     * 
     * @method onSpinBtnMouseDown
     * @private
     * @param {Event} evt The event object
     */
    NumberField.prototype.onSpinBtnMouseDown = function(evt){
        var fn;
        
        if(this.disabled){
            return;
        }

        switch(metaScore.Dom.data(evt.target, 'action')){
            case 'spin-down':
                fn = this.spinDown;
                break;
                
            default:
                fn = this.spinUp;
        }
        
        fn();
        
        this.interval = setInterval(fn, this.configs.spinInterval);
    };

    /**
     * The spin button's mouseup event handler
     * 
     * @method onSpinBtnMouseUp
     * @private
     * @param {Event} evt The event object
     */
    NumberField.prototype.onSpinBtnMouseUp = function(evt){
        clearInterval(this.interval);
    };

    /**
     * The spin button's mouseout event handler
     * 
     * @method onSpinBtnMouseOut
     * @private
     * @param {Event} evt The event object
     */
    NumberField.prototype.onSpinBtnMouseOut = NumberField.prototype.onSpinBtnMouseUp;

    /**
     * Decrement the value by one step
     * 
     * @method spinDown
     * @private
     */
    NumberField.prototype.spinDown = function(){
        var decimals, value;
        
        value = this.getValue() - this.configs.step; 
        
        // work around the well-known floating point issue       
        decimals = metaScore.Number.getDecimalPlaces(this.configs.step);
        value = parseFloat(value.toFixed(decimals));
        
        this.setValue(value);
    };

    /**
     * Increment the value by one step
     * 
     * @method spinUp
     * @private
     */
    NumberField.prototype.spinUp = function(){
        var decimals, value;
        
        value = this.getValue() + this.configs.step;
        
        // work around the well-known floating point issue
        decimals = metaScore.Number.getDecimalPlaces(this.configs.step);
        value = parseFloat(value.toFixed(decimals));
        
        this.setValue(value);
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Number} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    NumberField.prototype.setValue = function(value, supressEvent){
        value = parseFloat(value);
        
        if(isNaN(value)){
            value = 0;
        }
        
        if(this.min !== null){
            value = Math.max(value, this.min);
        }
        if(this.max !== null){
            value = Math.min(value, this.max);
        }
        
        NumberField.parent.prototype.setValue.call(this, value, supressEvent);
        
        return this;
    };

    /**
     * Set the minimum allowed value
     * 
     * @method setMin
     * @param {Number} value The minimum allowed value
     * @chainable
     */
    NumberField.prototype.setMin = function(value){
        this.min = value;

        return this;
    };

    /**
     * Set the maximum allowed value
     * 
     * @method setMax
     * @param {Number} value The maximum allowed value
     * @chainable
     */
    NumberField.prototype.setMax = function(value){
        this.max = value;

        return this;
    };

    /**
     * Reset the field's configs
     *
     * @method reset
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    NumberField.prototype.reset = function(supressEvent){
        this
            .setMin(this.configs.min)
            .setMax(this.configs.max);
        
        NumberField.parent.prototype.reset.call(this, supressEvent);

        return this;
    };

    return NumberField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Select = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * A select list field based on an HTML select element
     *
     * @class SelectField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.options=[]] A list of select options as objects with 'value' and 'text' keys
     * @param {Boolean} [configs.multiple=false] Whether multiple options can be selected at once
     */
    function SelectField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        SelectField.parent.call(this, this.configs);

        this.addClass('selectfield');
    }

    SelectField.defaults = {
        'options': [],
        'multiple': false
    };

    metaScore.editor.Field.extend(SelectField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    SelectField.prototype.setupUI = function(){
        var uid = 'field-'+ metaScore.String.uuid(5);

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new metaScore.Dom('<select/>', {'id': uid})
            .addListener('change', metaScore.Function.proxy(this.onChange, this))
            .appendTo(this.input_wrapper);

        metaScore.Array.each(this.configs.options, function(index, option){
            this.addOption(option.value, option.text);
        }, this);
        
        if(this.configs.multiple){
            this.input.attr('multiple', 'multiple');
        }
    };

    /**
     * Adds an option group to the select list
     * 
     * @method addGroup
     * @param {String} label The group's text label
     * @return {Dom} The created Dom object
     */
    SelectField.prototype.addGroup = function(label){
        var group = new metaScore.Dom('<optgroup/>', {'label': label});

        this.input.append(group);

        return group;
    };

    /**
     * Add an option to the select list
     * 
     * @method addOption
     * @param {String} value The option's value
     * @param {String} text The option's label
     * @param {Dom} [group] The group to append the option to, it will be appended to the root list if not specified
     * @return {Dom} The created Dom object
     */
    SelectField.prototype.addOption = function(value, text, group){
        var option = new metaScore.Dom('<option/>', {'value': value, 'text': text});

        option.appendTo(group ? group : this.input);

        return option;
    };

    /**
     * Update an option's label by value
     * 
     * @method updateOption
     * @param {String} value The value of the option to update
     * @param {String} text The new label's text
     * @return {Dom} The option's Dom object
     */
    SelectField.prototype.updateOption = function(value, text){
        var option = this.input.find('option[value="'+ value +'"]');

        option.text(text);

        return option;
    };

    /**
     * Remove an option by value
     * 
     * @method removeOption
     * @param {String} value The value of the option to remove
     * @return {Dom} The option's Dom object
     */
    SelectField.prototype.removeOption = function(value){
        var option = this.input.find('option[value="'+ value +'"]');

        option.remove();

        return option;
    };

    /**
     * Remove all groups and options
     * 
     * @method clear
     * @chainable
     */
    SelectField.prototype.clear = function(){
        this.input.empty();

        return this;
    };

    /**
     * Toggle the readonly attribute of the field
     * 
     * @method readonly
     * @param {Boolean} [readonly] Whether the field should be readonly, the current state is toggled if not provided
     * @chainable
     */
    SelectField.prototype.readonly = function(readonly){
        SelectField.parent.prototype.readonly.apply(this, arguments);

        this.input.attr('disabled', this.is_readonly ? "disabled" : null);

        return this;
    };

    return SelectField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Text = (function () {

    /**
     * A single-line text field based on an HTML input[type=text] element
     *
     * @class TextField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.value=''] The default value
     */
    function TextField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        TextField.parent.call(this, this.configs);

        this.addClass('textfield');
    }

    TextField.defaults = {
        'value': ''
    };

    metaScore.editor.Field.extend(TextField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    TextField.prototype.setupUI = function(){
        TextField.parent.prototype.setupUI.call(this);

        this.input.attr('type', 'text');
    };

    return TextField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Textarea = (function () {

    /**
     * A multi-line text field based on an HTML textarea element
     *
     * @class TextareaField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.value=''] The default value
     */
    function TextareaField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        TextareaField.parent.call(this, this.configs);

        this.addClass('textareafield');
    }

    TextareaField.defaults = {
        'value': ''
    };

    metaScore.editor.Field.extend(TextareaField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    TextareaField.prototype.setupUI = function(){
        var uid = 'field-'+ metaScore.String.uuid(5);

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new metaScore.Dom('<textarea></textarea>', {'id': uid})
            .addListener('change', metaScore.Function.proxy(this.onChange, this))
            .appendTo(this.input_wrapper);
    };

    return TextareaField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Time = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * Fired when the in button is clicked
     *
     * @event valuein
     */
    var EVT_VALUEIN = 'valuein';

    /**
     * Fired when the out button is clicked
     *
     * @event valueout
     */
    var EVT_VALUEOUT = 'valueout';
    
    var PARTS = [
        {
            "name": "hours",
            "regex": "[–0-9]{1,2}",
            "multiplier": 360000,
            "prefix": "",
            "suffix": "",
            "max_value": 99
        },
        {
            "name": "minutes",
            "regex": "[–0-5]?[–0-9]",
            "multiplier": 6000,
            "prefix": ":",
            "suffix": "",
            "max_value": 59
        },
        {
            "name": "seconds",
            "regex": "[–0-5]?[\–0-9]",
            "multiplier": 100,
            "prefix": ":",
            "suffix": "",
            "max_value": 59
        },
        {
            "name": "centiseconds",
            "regex": "[–0-9]{1,2}",
            "multiplier": 1,
            "prefix": ".",
            "suffix": "",
            "max_value": 99
        }
    ];

    var PART_PLACEHOLDER = "––";

    var GLOBAL_REGEX = new RegExp("^"+ PARTS.reduce(function(accumulator, value) {
          return accumulator + value.prefix +'('+ value.regex +')'+ value.suffix;
    }, "") +"$");

    /**
     * A time field for entering time values in hours:minutes:seconds:centiseconds format with optional in/out buttons
     *
     * @class TimeField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Number} [configs.value=0] The default value
     * @param {Number} [configs.min=0] The minimum allowed value
     * @param {Number} [configs.max=null] The maximum allowed value
     * @param {Boolean} [configs.clearButton=false] Whether to show the clear button
     * @param {Boolean} [configs.inButton=false] Whether to show the in button
     * @param {Boolean} [configs.outButton=false] Whether to show the out button
     */
    function TimeField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        TimeField.parent.call(this, this.configs);

        this.addClass('timefield');

        if(this.configs.min !== null){
            this.setMin(this.configs.min);
        }
        if(this.configs.max !== null){
            this.setMax(this.configs.max);
        }
    }

    TimeField.defaults = {
        'value': null,
        'min': 0,
        'max': null,
        'clearButton': false,
        'inButton': false,
        'outButton': false
    };

    metaScore.editor.Field.extend(TimeField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    TimeField.prototype.setupUI = function(){
        var buttons;

        TimeField.parent.prototype.setupUI.call(this);

        this.input_el = this.input.get(0);

        this.input
            .addListener('mousedown', metaScore.Function.proxy(this.onMouseDown, this))
            .addListener('mousewheel', metaScore.Function.proxy(this.onMouseWheel, this))
            .addListener('click', metaScore.Function.proxy(this.onClick, this))
            .addListener('focus', metaScore.Function.proxy(this.onFocus, this))
            .addListener('blur', metaScore.Function.proxy(this.onBlur, this))
            .addListener('dragstart', metaScore.Function.proxy(this.onDragstart, this))
            .addListener('drop', metaScore.Function.proxy(this.onDrop, this))
            .addListener('cut', metaScore.Function.proxy(this.onCut, this))
            .addListener('paste', metaScore.Function.proxy(this.onPaste, this))
            .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
            .addListener('keypress', metaScore.Function.proxy(this.onKeypress, this));

        if(this.configs.clearButton || this.configs.inButton || this.configs.outButton){
            buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
                .appendTo(this.input_wrapper);

            if(this.configs.clearButton){
                this.clearButton = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear', 'title': metaScore.Locale.t('editor.field.Time.clear.tooltip', 'Clear value')})
                    .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
                    .appendTo(buttons);
            }

            if(this.configs.inButton){
                this.inButton = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'in', 'title': metaScore.Locale.t('editor.field.Time.in.tooltip', 'Set field value to current time')})
                    .addListener('click', metaScore.Function.proxy(this.onInClick, this))
                    .appendTo(buttons);
            }

            if(this.configs.outButton){
                this.outButton = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'out', 'title': metaScore.Locale.t('editor.field.Time.out.tooltip', 'Set current time to field value')})
                    .addListener('click', metaScore.Function.proxy(this.onOutClick, this))
                    .appendTo(buttons);
            }
        }
    };

    /**
     * The change event handler
     * 
     * @method onChange
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onChange = function(evt){
        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    };

    /**
     * The mousedown event handler
     * 
     * @method onMouseDown
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onMouseDown = function(evt){
        this.skipFocus = true;
    };

    /**
     * The mousewheel event handler
     * 
     * @method onMouseWheel
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onMouseWheel = function(evt){
        var segment = this.getFocusedSegment();

        if(segment !== undefined){
            if(evt.deltaY < 0){
                this.incrementSegmentValue(segment);
                this.setFocusedSegment(segment);
            }
            else if(evt.deltaY > 0){
                this.decrementSegmentValue(segment);
                this.setFocusedSegment(segment);
            }
        }

        evt.preventDefault();
    };

    /**
     * The click event handler
     * 
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onClick = function(evt){
        var caretPosition = this.getCaretPosition();

        this.setFocusedSegment(Math.floor(caretPosition / 3));

        delete this.skipFocus;
    };

    /**
     * The focus event handler
     * 
     * @method onFocus
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onFocus = function(evt){
        this.keys_pressed = 0;

        if(!this.skipFocus){
            this.setFocusedSegment(0);
        }
    };

    /**
     * The blur event handler
     * 
     * @method onBlur
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onBlur = function(evt){
        delete this.keys_pressed;
        delete this.focused_segment;

        if(this.dirty){
            delete this.dirty;
            this.input.triggerEvent('change');
        }
    };

    /**
     * The dragstart event handler
     * 
     * @method onDragstart
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onDragstart = function(evt){
        evt.preventDefault();
    };

    /**
     * The drop event handler
     * 
     * @method onDrop
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onDrop = function(evt){
        evt.preventDefault();
    };

    /**
     * The cut event handler
     * 
     * @method onCut
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onCut = function(evt){
        evt.preventDefault();
    };

    /**
     * The paste event handler
     * 
     * @method onPaste
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onPaste = function(evt){
        var clipboard_data = evt.clipboardData || window.clipboardData,
            pasted_data = clipboard_data.getData('Text');

        if(this.isValid(pasted_data)){
            this.setValue(this.getNumericalValue(pasted_data), false);
        }

        evt.preventDefault();
    };

    /**
     * The keydown event handler
     * 
     * @method onKeydown
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onKeydown = function(evt){
        var segment;

        switch (evt.keyCode) {
            case 37: // left arrow
            case 39: // right arrow
                segment = this.getFocusedSegment() + (evt.keyCode === 37 ? -1 : 1);

                if(segment >= 0 && segment < PARTS.length){
                    this.setFocusedSegment(segment);
                }

                evt.preventDefault();
                break;
                
            case 38: // up arrow
                segment = this.getFocusedSegment();

                if(segment !== undefined){
                    this.incrementSegmentValue(segment);
                    this.setFocusedSegment(segment);
                }
                
                evt.preventDefault();
                break;
                
            case 40: // down arrow
                segment = this.getFocusedSegment();

                if(segment !== undefined){
                    this.decrementSegmentValue(segment);
                    this.setFocusedSegment(segment);
                }

                evt.preventDefault();
                break;
                
            case 9: // tab
                segment = this.getFocusedSegment() + (evt.shiftKey ? -1 : 1);

                if(segment >= 0 && segment < PARTS.length){
                    this.setFocusedSegment(segment);
                    evt.preventDefault();
                }

                break;
        }
    };

    /**
     * The keypress event handler
     * 
     * @method onKeypress
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onKeypress = function(evt){
        var focused_segment = this.getFocusedSegment(),
            segment_value;

        // Numeric key
        if(focused_segment < PARTS.length && evt.keyCode >= 48 && evt.keyCode <= 57){
            segment_value = parseInt(this.getSegmentValue(focused_segment));

            if(this.keys_pressed === 0 || isNaN(segment_value)){
                segment_value = 0;
            }

            segment_value += String.fromCharCode(evt.keyCode);

            segment_value = metaScore.String.pad(Math.min(PARTS[focused_segment].max_value, parseInt(segment_value)), 2, "0", "left");

            if(this.setSegmentValue(focused_segment, segment_value, true)){
                this.dirty = true;
            }

            if(++this.keys_pressed === 2){
                this.keys_pressed = 0;
                this.setFocusedSegment(focused_segment + 1);
            }
            else{
                this.setFocusedSegment(focused_segment);
            }
        }
        // Enter key
        else if(evt.keyCode === 13 && this.dirty){
            delete this.dirty;
            this.input.triggerEvent('change');
        }

        evt.preventDefault();
    };

    /**
     * The clear button click event handler
     * 
     * @method onClearClick
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onClearClick = function(evt){
        this.setValue(null);
    };

    /**
     * The in button's click event handler
     * 
     * @method onInClick
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onInClick = function(evt){
        this.triggerEvent(EVT_VALUEIN, {'field': this});
    };

    /**
     * The out button's click event handler
     * 
     * @method onOutClick
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onOutClick = function(evt){
        this.triggerEvent(EVT_VALUEOUT, {'field': this, 'value': this.getValue()});
    };

    /**
     * Helper function to check if a certain value is a valid textual value
     * 
     * @method isValid
     * @private
     * @param {String} value The value to check
     */
    TimeField.prototype.isValid = function(value){
        return GLOBAL_REGEX.test(value);
    };

    /**
     * Helper function to retreive the input's current caret position
     * 
     * @method getCaretPosition
     * @private
     * @return {Number} The caret position
     */
    TimeField.prototype.getCaretPosition = function(){
        var caretPosition;
            
        if(typeof this.input_el.selectionStart === 'number'){
            caretPosition = this.input_el.selectionDirection === 'backward' ? this.input_el.selectionStart : this.input_el.selectionEnd;
        }
        
        return caretPosition;
    };

    /**
     * Helper function to retreive the index of the focused segmnet
     * 
     * @method getFocusedSegment
     * @private
     * @return {Number} The focus segment's index
     */
    TimeField.prototype.getFocusedSegment = function(){
        return this.focused_segment;
    };

    /**
     * Helper function to set the focused segmnet
     * 
     * @method setFocusedSegment
     * @private
     * @param {Number} segment The focus segment's index
     */
    TimeField.prototype.setFocusedSegment = function(segment){
        var start = segment * 3,
            end = start + 2;
            
        this.input_el.setSelectionRange(0, 0);
        this.input_el.setSelectionRange(start, end, 'forward');
                  
        this.focused_segment = segment;
    };

    /**
     * Helper function to retreive the value of a segmnet
     * 
     * @method getSegmentValue
     * @private
     * @param {Number} segment The segment's index
     * @return {String} The segment's value
     */
    TimeField.prototype.getSegmentValue = function(segment){
        var textual_value = this.input.val(),
            matches = textual_value.match(GLOBAL_REGEX);

        if(matches){
            matches.shift();
            return matches[segment];
        }
    };

    /**
     * Helper function to set the value of a segmnet
     * 
     * @method setSegmentValue
     * @private
     * @param {Number} segment The segment's index
     * @param {String} value The segment's value
     * @param {Boolean} supressEvent Whether to prevent the change event from firing
     * @return {Boolean} Whether the value was set
     */
    TimeField.prototype.setSegmentValue = function(segment, value, supressEvent){
        var textual_value = this.input.val(),
            matches = textual_value.match(GLOBAL_REGEX);

        if(matches){
            textual_value = "";
            matches.shift();

            matches.forEach(function(match, i){
                textual_value += PARTS[i].prefix;
                textual_value += (i === segment) ? value : (matches[i] === "––" ? "00" : matches[i]);
                textual_value += PARTS[i].suffix;
            });

            this.setValue(this.getNumericalValue(textual_value), supressEvent);

            return true;
        }

        return false;
    };

    /**
     * Helper function to increment a segment's value
     * 
     * @method incrementSegmentValue
     * @private
     * @param {Number} segment The segment's index
     * @chainable
     */
    TimeField.prototype.incrementSegmentValue = function(segment){
        var value = this.getValue();

        if(value === null){
            value = 0;
        }

        value += PARTS[segment].multiplier;
        this.setValue(Math.max(0, value));

        return this;
    };

    /**
     * Helper function to decrement a segment's value
     * 
     * @method decrementSegmentValue
     * @private
     * @param {Number} segment The segment's index
     * @chainable
     */
    TimeField.prototype.decrementSegmentValue = function(segment){
        var value = this.getValue();

        value = this.getValue();

        if(value === null){
            value = 0;
        }
        
        if(value >= PARTS[segment].multiplier){
            value -= PARTS[segment].multiplier;
            this.setValue(Math.max(0, value));
        }

        return this;
    };

    /**
     * Helper function to convert a textual value to a numerical one
     * 
     * @method getNumericalValue
     * @private
     * @param {String} textual_value The textual value
     * @return {Number} The numercial value
     */
    TimeField.prototype.getNumericalValue = function(textual_value){
        var matches, value;

        if(textual_value.indexOf(PART_PLACEHOLDER) !== -1){
            return null;
        }

        matches = textual_value.match(GLOBAL_REGEX);
        value = 0;
        
        if(matches){
            matches.shift();

            matches.forEach(function(match, i){
                value += parseInt(matches[i]) * PARTS[i].multiplier;
            });
        }
        
        return value;
    };

    /**
     * Helper function to convert a numerical value to a textual one
     * 
     * @method getTextualValue
     * @private
     * @param {Number} value The numercial value
     * @return {String} The textual value
     */
    TimeField.prototype.getTextualValue = function(value){
        var textual_value = "";

        PARTS.forEach(function(part, i){
            textual_value += part.prefix;

            if(value === null){
                textual_value += PART_PLACEHOLDER;
            }
            else{
                textual_value += metaScore.String.pad(parseInt((value / part.multiplier) % (part.max_value + 1), 10) || 0, 2, "0", "left");
            }

            textual_value += part.suffix;
        });
        
        return textual_value;
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Number} centiseconds The new value in centiseconds
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    TimeField.prototype.setValue = function(value, supressEvent){
        if(value !== null){
            value = parseInt(value);
    
            if(this.min !== null){
                value = Math.max(value, this.min);
            }
    
            if(this.max !== null){
                value = Math.min(value, this.max);
            }
        }

        this.input.val(this.getTextualValue(value));

        this.value = value;

        if(supressEvent !== true){
            this.input.triggerEvent('change');
        }

        return this;
    };

    /**
     * Set the minimum allowed value
     * 
     * @method setMin
     * @param {Number} min The minimum allowed value
     * @chainable
     */
    TimeField.prototype.setMin = function(min){
        var value = this.getValue();

        this.min = min;

        if(this.min !== null && value !== null && value < this.min){
            this.setValue(this.min);
        }

        return this;
    };

    /**
     * Set the maximum allowed value
     * 
     * @method setMax
     * @param {Number} max The maximum allowed value
     * @chainable
     */
    TimeField.prototype.setMax = function(max){
        var value = this.getValue();

        this.max = max;

        if(this.max !== null && value !== null && value > this.max){
            this.setValue(this.max);
        }

        return this;
    };

    /**
     * Disable the field
     * 
     * @method disable
     * @chainable
     */
    TimeField.prototype.disable = function(){
        TimeField.parent.prototype.disable.call(this);

        if(this.clearButton){
            this.clearButton.attr('disabled', 'disabled');
        }

        if(this.inButton){
            this.inButton.attr('disabled', 'disabled');
        }
        if(this.outButton){
            this.outButton.attr('disabled', 'disabled');
        }

        return this;
    };

    /**
     * Enable the field
     * 
     * @method enable
     * @chainable
     */
    TimeField.prototype.enable = function(){        
        TimeField.parent.prototype.enable.call(this);

        if(this.clearButton){
            this.clearButton.attr('disabled', null);
        }

        if(this.inButton){
            this.inButton.attr('disabled', null);
        }
        if(this.outButton){
            this.outButton.attr('disabled', null);
        }

        return this;
    };

    /**
     * Toggle the field's readonly state
     *
     * @method readonly
     * @param {Boolean} [readonly] Whether the field should be readonly, the current state is toggled if not provided
     * @chainable
     */
    TimeField.prototype.readonly = function(readonly){
        var readonly_attr;
        
        TimeField.parent.prototype.readonly.call(this, readonly);
        
        readonly_attr = this.is_readonly ? "readonly" : null;

        if(this.clearButton){
            this.clearButton.attr('readonly', readonly_attr);
        }
        
        if(this.inButton){
            this.inButton.attr('readonly', readonly_attr);
        }

        return this;
    };

    /**
     * Reset the field's configs
     *
     * @method reset
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    TimeField.prototype.reset = function(supressEvent){
        this
            .setMin(this.configs.min)
            .setMax(this.configs.max);
        
        TimeField.parent.prototype.reset.call(this, supressEvent);

        return this;
    };

    return TimeField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.panel').Block = (function () {

    /**
     * A panel for {{#crossLink "player.component.Block"}}{{/crossLink}} components
     * 
     * @class Block
     * @namespace editor.panel
     * @extends editor.Panel
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.toolbarConfigs={'title':'Block', 'menuItems': {...}}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    function BlockPanel(configs) {
        // call parent constructor
        BlockPanel.parent.call(this, configs);

        this.addClass('block');
    }

    BlockPanel.defaults = {
        'toolbarConfigs': {
            'title': metaScore.Locale.t('editor.panel.Block.title', 'Block'),
            'menuItems': {
                'synched': metaScore.Locale.t('editor.panel.Block.menuItems.synched', 'Add a synchronized block'),
                'non-synched': metaScore.Locale.t('editor.panel.Block.menuItems.non-synched', 'Add a non-synchronized block'),
                'block-toggler': metaScore.Locale.t('editor.panel.Block.menuItems.block-toggler', 'Add a block toggler'),
                'delete': metaScore.Locale.t('editor.panel.Block.menuItems.delete', 'Delete the active block')
            }
        }
    };

    metaScore.editor.Panel.extend(BlockPanel);

    /**
     * Get the currently associated component's label
     *
     * @method getSelectorLabel
     * @return {String} The component's label for use in the selector
     */
    BlockPanel.prototype.getSelectorLabel = function(component){
        if(component.instanceOf('Block')){
            if(component.getProperty('synched')){
                return metaScore.Locale.t('editor.panel.Block.selector.labelSynched', '!name (synched)', {'!name': component.getName()});
            }
            else{
                return metaScore.Locale.t('editor.panel.Block.selector.labelNotSynched', '!name (not synched)', {'!name': component.getName()});
            }
        }
        
        return BlockPanel.parent.prototype.getSelectorLabel.call(this, component);
    };

    return BlockPanel;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.panel').Element = (function () {

    /**
     * Fired when a component's text is locked
     *
     * @event textlock
     * @param {Object} component The component instance
     */
    var EVT_TEXTLOCK = 'textlock';

    /**
     * Fired when a component's text is unlocked
     *
     * @event textunlock
     * @param {Object} component The component instance
     */
    var EVT_TEXTUNLOCK = 'textunlock';

    /**
     * A panel for {{#crossLink "player.component.Element"}}{{/crossLink}} components
     * 
     * @class Element
     * @namespace editor.panel
     * @extends editor.Panel
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.toolbarConfigs={'title':'Element', 'menuItems': {...}}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    function ElementPanel(configs) {        
        // call parent constructor
        ElementPanel.parent.call(this, configs);
        
        // fix event handlers scope
        this.onComponentDblClick = metaScore.Function.proxy(this.onComponentDblClick, this);
        this.onComponentContentsClick = metaScore.Function.proxy(this.onComponentContentsClick, this);
        this.onComponentContentsKey = metaScore.Function.proxy(this.onComponentContentsKey, this);

        this.addClass('element');
        
        this
            .addListener('componentset', metaScore.Function.proxy(this.onComponentSet, this))
            .addListener('componentbeforeunset', metaScore.Function.proxy(this.onComponentBeforeUnset, this));
    }

    ElementPanel.defaults = {
        'toolbarConfigs': {
            'title': metaScore.Locale.t('editor.panel.Element.title', 'Element'),
            'menuItems': {
                'Cursor': metaScore.Locale.t('editor.panel.Element.menuItems.Cursor', 'Add a new cursor'),
                'Image': metaScore.Locale.t('editor.panel.Element.menuItems.Image', 'Add a new image'),
                'Text': metaScore.Locale.t('editor.panel.Element.menuItems.Text', 'Add a new text element'),
                'delete': metaScore.Locale.t('editor.panel.Element.menuItems.delete', 'Delete the active element')
            }
        }
    };

    metaScore.editor.Panel.extend(ElementPanel);

    /**
     * Get the currently associated component's label
     *
     * @method getSelectorLabel
     * @return {String} The component's label for use in the selector
     */
    ElementPanel.prototype.getSelectorLabel = function(component){
        var page = component.getPage(),
            block = page.getBlock(),
            page_start_time, page_end_time,
            element_start_time, element_end_time,
            out_of_range = false;
        
        if(block.getProperty('synched')){
            page_start_time = page.getProperty('start-time');
            page_end_time = page.getProperty('end-time');
            
            element_start_time = component.getProperty('start-time');
            element_end_time = component.getProperty('end-time');

            out_of_range = ((element_start_time !== null) && (element_start_time < page_start_time)) || ((element_end_time !== null) && (element_end_time > page_end_time));
        }
        
        return (out_of_range ? '*' : '') + component.getName();
    };

    /**
     * The fields' valuechange event handler
     *
     * @method onFieldValueChange
     * @private
     * @param {Event} evt The event object
     */
    ElementPanel.prototype.onFieldValueChange = function(evt){
        var component = this.getComponent(),
            name = evt.detail.field.data('name'),
            type;

        if(component){
            type = component.getProperty('type');
            
            switch(type){
                case 'Image':
                    if(evt.detail.field.data('name') === 'background-image'){
                        this.onBeforeImageSet(name, evt.detail.value);
                    }
                    break;
                    
                case 'Text':
                    if(evt.detail.field.data('name') === 'text-locked'){
                        if(evt.detail.value === true){
                            this.lockText();
                        }
                        else{
                            this.unlockText();
                        }
                    }
                    break;
            }
        }

        ElementPanel.parent.prototype.onFieldValueChange.call(this, evt);
    };

    /**
     * The componentset event handler
     * 
     * @method onComponentSet
     * @private
     * @param {Event} evt The event object
     */
    ElementPanel.prototype.onComponentSet = function(evt){
        if(evt.detail.component.getProperty('type') === 'Text'){
            this.updateFieldValue('text-locked', true);
        }
    };

    /**
     * The componentunset event handler
     * 
     * @method onComponentUnset
     * @private
     * @param {Event} evt The event object
     */
    ElementPanel.prototype.onComponentBeforeUnset = function(evt){
        if(evt.detail.component.getProperty('type') === 'Text'){
            this.updateFieldValue('text-locked', true);
        }
    };

    /**
     * The beforeimageset event handler
     * 
     * @method onBeforeImageSet
     * @private
     * @param {String} property The updated component property's name
     * @param {String} url The new image url
     */
    ElementPanel.prototype.onBeforeImageSet = function(property, url){
        var panel = this,
            component = panel.getComponent(),
            old_src, new_src;

        old_src = component.getProperty(property);
        new_src = url;

        if(old_src){
            panel.getImageMetadata(old_src, function(old_metadata){
                var name = component.getProperty('name'),
                    width = component.getProperty('width'),
                    height = component.getProperty('height');

                if((old_metadata.name === name) || (old_metadata.width === width && old_metadata.height === height)){
                    panel.getImageMetadata(new_src, function(new_metadata){
                        if(old_metadata.name === name){
                            panel.updateFieldValue('name', new_metadata.name);
                        }

                        if(old_metadata.width === width && old_metadata.height === height){
                            panel.updateFieldValue('width', new_metadata.width);
                            panel.updateFieldValue('height', new_metadata.height);
                        }
                    });
                }
            });
        }
        else{
            panel.getImageMetadata(new_src, function(new_metadata){
                panel.updateFieldValue('name', new_metadata.name);
                panel.updateFieldValue('width', new_metadata.width);
                panel.updateFieldValue('height', new_metadata.height);
            });
        }

    };

    /**
     * Get an image's metadata (name, width, and height)
     * 
     * @method getImageMetadata
     * @private
     * @param {String} url The image's url
     * @param {Function} callback The callback to call with the retreived metadata
     */
    ElementPanel.prototype.getImageMetadata = function(url, callback){
        var img = new metaScore.Dom('<img/>')
            .addListener('load', function(evt){
                var el = img.get(0),
                    matches, name;

                if(matches = el.src.match(/([^/]*)\.[^.]*$/)){
                    name = matches[1];
                }

                callback({
                    'name': name,
                    'width': el.naturalWidth,
                    'height': el.naturalHeight
                });
            })
            .attr('src', url);
    };

    /**
     * Lock the component's text
     * 
     * @method lockText
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    ElementPanel.prototype.lockText = function(supressEvent){
        var component = this.getComponent();

        if(component){
            component
                .addListener('dblclick', this.onComponentDblClick)
                .removeClass('text-unlocked');
                
            component.contents
                .attr('contenteditable', null)
                .removeListener('click', this.onComponentContentsClick)
                .removeListener('keydown', this.onComponentContentsKey)
                .removeListener('keypress', this.onComponentContentsKey)
                .removeListener('keyup', this.onComponentContentsKey);

            if(component._draggable){
                component._draggable.enable();
            }
            if(component._resizable){
                component._resizable.enable();
            }

            if(supressEvent !== true){
                this.triggerEvent(EVT_TEXTLOCK, {'component': component}, false);
            }
        }

        return this;
    };

    /**
     * Unlock the component's text
     * 
     * @method unlockText
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    ElementPanel.prototype.unlockText = function(supressEvent){
        var component = this.getComponent();

        if(component){
            if(component._draggable){
                component._draggable.disable();
            }
            if(component._resizable){
                component._resizable.disable();
            }

            component.contents
                .attr('contenteditable', 'true')
                .addListener('click', this.onComponentContentsClick)
                .addListener('keydown', this.onComponentContentsKey)
                .addListener('keypress', this.onComponentContentsKey)
                .addListener('keyup', this.onComponentContentsKey);

            component
                .removeListener('dblclick', this.onComponentDblClick)
                .addClass('text-unlocked');

            if(supressEvent !== true){
                this.triggerEvent(EVT_TEXTUNLOCK, {'component': component}, false);
            }
        }

        return this;
    };

    /**
     * The component dblclick event handler
     * 
     * @method onComponentDblClick
     * @private
     * @param {Event} evt The event object
     */
    ElementPanel.prototype.onComponentDblClick = function(evt){
        this.updateFieldValue('text-locked', false);
    };

    /**
     * The component's contents click event handler
     * 
     * @method onComponentContentsClick
     * @private
     * @param {Event} evt The event object
     */
    ElementPanel.prototype.onComponentContentsClick = function(evt){
        evt.stopPropagation();
    };

    /**
     * The component's contents key event handler
     * 
     * @method onComponentContentsKey
     * @private
     * @param {Event} evt The event object
     */
    ElementPanel.prototype.onComponentContentsKey = function(evt){
        evt.stopPropagation();
    };

    return ElementPanel;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.panel').Page = (function () {

    /**
     * A panel for {{#crossLink "player.component.Page"}}{{/crossLink}} components
     * 
     * @class Page
     * @namespace editor.panel
     * @extends editor.Panel
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.toolbarConfigs={'title':'Page', 'menuItems': {...}}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    function PagePanel(configs) {
        // call parent constructor
        PagePanel.parent.call(this, configs);

        this.addClass('page');
    }

    PagePanel.defaults = {
        'toolbarConfigs': {
            'title': metaScore.Locale.t('editor.panel.Page.title', 'Page'),
            'menuItems': {
                'new': metaScore.Locale.t('editor.panel.Page.menuItems.new', 'Add a new page'),
                'delete': metaScore.Locale.t('editor.panel.Page.menuItems.delete', 'Delete the active page')
            }
        }
    };

    metaScore.editor.Panel.extend(PagePanel);

    return PagePanel;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.panel').Toolbar = (function(){

    /**
     * A title toolbar for panel's
     *
     * @class Toolbar
     * @namespace editor.panel
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.title=''] The text to display as a title
     * @param {Array} [configs.buttons=['previous', 'next']] The buttons to display
     * @param {Boolean} [configs.selector=true] Whether to display a selector
     * @param {Object} [configs.menuItems={}}] A list of dropdown menu items to display
     */
    function Toolbar(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Toolbar.parent.call(this, '<div/>', {'class': 'toolbar clearfix'});

        this.title = new metaScore.Dom('<div/>', {'class': 'title', 'text': this.configs.title})
            .appendTo(this);

        this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .appendTo(this);

        metaScore.Array.each(this.configs.buttons, function(index, action){
            this.addButton(action);
        }, this);

        if(this.configs.selector){
            this.selector = new metaScore.editor.field.Select()
                .addClass('selector')
                .appendTo(this);
        }

        if(!metaScore.Var.isEmpty(this.configs.menuItems)){
            this.menu = new metaScore.editor.DropDownMenu();

            metaScore.Object.each(this.configs.menuItems, function(action, label){
                this.menu.addItem(action, label);
            }, this);
            
            new metaScore.Dom('<div/>', {'class': 'menu'})
                .appendTo(this.buttons)
                .append(this.menu);
        }
    }

    Toolbar.defaults = {
        'title': '',
        'buttons': ['previous', 'next'],
        'selector': true,
        'menuItems': {}
    };

    metaScore.Dom.extend(Toolbar);

    /**
     * Get the title's Dom object
     * 
     * @method getTitle
     * @return {Dom} The Dom object
     */
    Toolbar.prototype.getTitle = function(){
        return this.title;
    };

    /**
     * Get the selector field
     * 
     * @method getSelector
     * @return {editor.field.Select} The selector field
     */
    Toolbar.prototype.getSelector = function(){
        return this.selector;
    };

    /**
     * Get the dropdown menu
     * 
     * @method getMenu
     * @return {editor.DropDownMenu} The dropdown menu
     */
    Toolbar.prototype.getMenu = function(){
        return this.menu;
    };

    /**
     * Add a button
     * 
     * @method addButton
     * @param {String} action The button's associated action
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
     * @param {String} action The button's associated action
     * @return {Dom} The button's Dom object
     */
    Toolbar.prototype.getButton = function(action){
        return this.buttons.children('[data-action="'+ action +'"]');
    };

    /**
     * Toggle the enabled state of a menu item
     * 
     * @method toggleMenuItem
     * @param {String} action The item's associated action
     * @param {Boolean} state The enabled state to set
     * @chainable
     */
    Toolbar.prototype.toggleMenuItem = function(action, state){
        var menu = this.getMenu();

        if(menu){
            menu.toggleItem(action, state);
        }

        return this;
    };

    return Toolbar;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').BorderRadius = (function () {

    /**
     * Fired when the submit button is clicked
     *
     * @event submit
     * @param {Object} overlay The overlay instance
     * @param {String} value The border radius value in CSS format
     */
    var EVT_SUBMIT = 'submit';

    /**
     * An overlay that simplifies the creation of a CSS border-radius value
     *
     * @class BorderRadius
     * @namespace editor.overlay
     * @extends Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.parent='.metaScore-editor'] The parent element in which the overlay will be appended
     * @param {Boolean} [configs.toolbar=true] Whether to show a toolbar with a title and close button
     * @param {String} [configs.title='Border Radius'] The overlay's title
     */
    function BorderRadius(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        BorderRadius.parent.call(this, this.configs);

        this.addClass('border-radius');
    }

    BorderRadius.defaults = {
        'parent': '.metaScore-editor',
        'toolbar': true,
        'title': metaScore.Locale.t('editor.overlay.BorderRadius.title', 'Border Radius')
    };

    metaScore.Overlay.extend(BorderRadius);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    BorderRadius.prototype.setupUI = function(){
        var contents;

        // call parent method
        BorderRadius.parent.prototype.setupUI.call(this);

        contents = this.getContents();

        this.fields = {};
        this.buttons = {};

        this.preview = new metaScore.Dom('<div/>', {'class': 'preview'})
            .appendTo(contents);

        this.fields.tlw = new metaScore.editor.field.Number({'min': 0})
            .addClass('tlw')
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .appendTo(this.preview);

        this.fields.tlh = new metaScore.editor.field.Number({'min': 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('tlh')
            .appendTo(this.preview);

        this.fields.trw = new metaScore.editor.field.Number({'min': 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('trw')
            .appendTo(this.preview);

        this.fields.trh = new metaScore.editor.field.Number({'min': 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('trh')
            .appendTo(this.preview);

        this.fields.brw = new metaScore.editor.field.Number({'min': 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('brw')
            .appendTo(this.preview);

        this.fields.brh = new metaScore.editor.field.Number({'min': 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('brh')
            .appendTo(this.preview);

        this.fields.blw = new metaScore.editor.field.Number({'min': 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('blw')
            .appendTo(this.preview);

        this.fields.blh = new metaScore.editor.field.Number({'min': 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('blh')
            .appendTo(this.preview);

        // Buttons
        this.buttons.apply = new metaScore.Button({'label': 'Apply'})
            .addClass('submit')
            .addListener('click', metaScore.Function.proxy(this.onApplyClick, this))
            .appendTo(contents);

        this.buttons.cancel = new metaScore.Button({'label': 'Cancel'})
            .addClass('cancel')
            .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
            .appendTo(contents);

    };

    /**
     * The valuechange event handler
     * 
     * @method onValueChange
     * @private
     * @param {Event} evt The event object
     */
    BorderRadius.prototype.onValueChange = function(){
        var radius    = '';

        radius += this.fields.tlw.getValue() +'px ';
        radius += this.fields.trw.getValue() +'px ';
        radius += this.fields.brw.getValue() +'px ';
        radius += this.fields.blw.getValue() +'px ';
        radius += '/ ';
        radius += this.fields.tlh.getValue() +'px ';
        radius += this.fields.trh.getValue() +'px ';
        radius += this.fields.brh.getValue() +'px ';
        radius += this.fields.blh.getValue() +'px';

        this.preview.css('border-radius', radius);
    };

    /**
     * Set the current value
     * 
     * @method setValue
     * @param {String} val The value in CSS border-radius format
     * @chainable
     */
    BorderRadius.prototype.setValue = function(val){
        var matches,
            values = {
                tlw: 0, tlh: 0,
                trw: 0, trh: 0,
                blw: 0, blh: 0,
                brw: 0, brh: 0
            };

        this.preview.css('border-radius', val);

        if(matches = this.preview.css('border-top-left-radius', undefined, true).match(/(\d*)px/g)){
            if(matches.length > 1){
                values.tlw = matches[0];
                values.tlh = matches[1];
            }
            else{
                values.tlw = values.tlh = matches[0];
            }
        }

        if(matches = this.preview.css('border-top-right-radius', undefined, true).match(/(\d*)px/g)){
            if(matches.length > 1){
                values.trw = matches[0];
                values.trh = matches[1];
            }
            else{
                values.trw = values.trh = matches[0];
            }
        }

        if(matches = this.preview.css('border-bottom-left-radius', undefined, true).match(/(\d*)px/g)){
            if(matches.length > 1){
                values.blw = matches[0];
                values.blh = matches[1];
            }
            else{
                values.blw = values.blh = matches[0];
            }
        }

        if(matches = this.preview.css('border-bottom-right-radius', undefined, true).match(/(\d*)px/g)){
            if(matches.length > 1){
                values.brw = matches[0];
                values.brh = matches[1];
            }
            else{
                values.brw = values.brh = matches[0];
            }
        }

        metaScore.Object.each(this.fields, function(key, field){
            field.setValue(parseInt(values[key], 10), true);
        });

        return this;
    };

    /**
     * Get the current value
     * 
     * @method getValue
     * @return {String} The value in CSS border-radius format
     */
    BorderRadius.prototype.getValue = function(){
        return this.preview.css('border-radius');
    };

    /**
     * The apply button's click event handler
     * 
     * @method onApplyClick
     * @private
     * @param {Event} evt The event object
     */
    BorderRadius.prototype.onApplyClick = function(evt){
        this.triggerEvent(EVT_SUBMIT, {'overlay': this, 'value': this.getValue()}, true, false);
        this.hide();
    };

    /**
     * The cancel button's click event handler
     * 
     * @method onCancelClick
     * @private
     * @param {Event} evt The event object
     */
    BorderRadius.prototype.onCancelClick = BorderRadius.prototype.onCloseClick;

    return BorderRadius;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').ColorSelector = (function () {

    /**
     * Fired when the submit button is clicked
     *
     * @event submit
     * @param {Object} overlay The overlay instance
     * @param {Object} value The color value in rgba format
     */
    var EVT_SUBMIT = 'submit';

    /**
     * An overlay to select an RGBA color
     *
     * @class ColorSelector
     * @namespace editor.overlay
     * @extends Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.parent='.metaScore-editor'] The parent element in which the overlay will be appended
     */
    function ColorSelector(configs) {
        this.configs = this.getConfigs(configs);

        // fix event handlers scope
        this.onGradientMousemove = metaScore.Function.proxy(this.onGradientMousemove, this);
        this.onAlphaMousemove = metaScore.Function.proxy(this.onAlphaMousemove, this);

        // call parent constructor
        ColorSelector.parent.call(this, this.configs);

        this.addClass('color-selector');
    }

    ColorSelector.defaults = {
        'parent': '.metaScore-editor'
    };

    metaScore.Overlay.extend(ColorSelector);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    ColorSelector.prototype.setupUI = function(){
        // call parent method
        ColorSelector.parent.prototype.setupUI.call(this);

        this.gradient = new metaScore.Dom('<div/>', {'class': 'gradient'}).appendTo(this.contents);
        
        this.gradient.canvas = new metaScore.Dom('<canvas/>', {'width': '255', 'height': '255'})
            .addListener('click', metaScore.Function.proxy(this.onGradientClick, this))
            .addListener('mousedown', metaScore.Function.proxy(this.onGradientMousedown, this))
            .addListener('mouseup', metaScore.Function.proxy(this.onGradientMouseup, this))
            .appendTo(this.gradient);
            
        this.gradient.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(this.gradient);

        this.alpha = new metaScore.Dom('<div/>', {'class': 'alpha'}).appendTo(this.contents);
        
        this.alpha.canvas = new metaScore.Dom('<canvas/>', {'width': '20', 'height': '255'})
            .addListener('click', metaScore.Function.proxy(this.onAlphaClick, this))
            .addListener('mousedown', metaScore.Function.proxy(this.onAlphaMousedown, this))
            .addListener('mouseup', metaScore.Function.proxy(this.onAlphaMouseup, this))
            .appendTo(this.alpha);
            
        this.alpha.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(this.alpha);

        this.controls = new metaScore.Dom('<div/>', {'class': 'controls'}).appendTo(this.contents);

        this.controls.r = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'r'})
            .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
            
        new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
            .append(new metaScore.Dom('<label/>', {'text': 'R', 'for': 'r'}))
            .append(this.controls.r)
            .appendTo(this.controls);

        this.controls.g = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'g'})
            .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
            
        new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
            .append(new metaScore.Dom('<label/>', {'text': 'G', 'for': 'g'}))
            .append(this.controls.g)
            .appendTo(this.controls);

        this.controls.b = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'b'})
            .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
            
        new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
            .append(new metaScore.Dom('<label/>', {'text': 'B', 'for': 'b'}))
            .append(this.controls.b)
            .appendTo(this.controls);

        this.controls.a = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '1', 'step': '0.01', 'name': 'a'})
            .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
            
        new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
            .append(new metaScore.Dom('<label/>', {'text': 'A', 'for': 'a'}))
            .append(this.controls.a)
            .appendTo(this.controls);

        this.controls.current = new metaScore.Dom('<canvas/>');
        
        new metaScore.Dom('<div/>', {'class': 'canvas-wrapper current'})
            .append(this.controls.current)
            .appendTo(this.controls);

        this.controls.previous = new metaScore.Dom('<canvas/>');
        
        new metaScore.Dom('<div/>', {'class': 'canvas-wrapper previous'})
            .append(this.controls.previous)
            .appendTo(this.controls);

        this.controls.cancel = new metaScore.Button({'label': 'Cancel'})
            .addClass('cancel')
            .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
            .appendTo(this.controls);

        this.controls.apply = new metaScore.Button({'label': 'Apply'})
            .addClass('submit')
            .addListener('click', metaScore.Function.proxy(this.onApplyClick, this))
            .appendTo(this.controls);

        this.fillGradient();

    };

    /**
     * Set the current value
     * 
     * @method setValue
     * @param {Mixed} val The value in a format accepted by {{#crossLink "Color/parse:method"}}Color.parse{{/crossLink}}
     * @chainable
     */
    ColorSelector.prototype.setValue = function(val){
        this.updateValue(val);

        this.previous_value = this.value;

        this.fillPrevious();

        return this;
    };

    /**
     * Update the selected value
     * 
     * @method updateValue
     * @private
     * @param {Mixed} val The value in a format accepted by {{#crossLink "Color/parse:method"}}Color.parse{{/crossLink}}
     * @param {Boolean} refillAlpha Whether to refill the alpha indicator canvas
     * @param {Boolean} updatePositions Whether to update the cursor positions
     * @param {Boolean} updateInputs Whether to update the input values
     * @chainable
     */
    ColorSelector.prototype.updateValue = function(val, refillAlpha, updatePositions, updateInputs){

        var hsv;

        this.value = this.value || {};

        if(!metaScore.Var.is(val, 'object')){
            val = metaScore.Color.parse(val);
        }

        if('r' in val){
            this.value.r = parseInt(val.r, 10);
        }
        if('g' in val){
            this.value.g = parseInt(val.g, 10);
        }
        if('b' in val){
            this.value.b = parseInt(val.b, 10);
        }
        if('a' in val){
            this.value.a = parseFloat(val.a);
        }

        if(refillAlpha !== false){
            this.fillAlpha();
        }

        if(updateInputs !== false){
            this.controls.r.val(this.value.r);
            this.controls.g.val(this.value.g);
            this.controls.b.val(this.value.b);
            this.controls.a.val(this.value.a);
        }

        if(updatePositions !== false){
            hsv = metaScore.Color.rgb2hsv(this.value);

            this.gradient.position.css('left', ((1 - hsv.h) * 255) +'px');
            this.gradient.position.css('top', (hsv.s * (255 / 2)) + ((1 - (hsv.v/255)) * (255/2)) +'px');

            this.alpha.position.css('top', ((1 - this.value.a) * 255) +'px');
        }

        this.fillCurrent();

        return this;

    };

    /**
     * Fill the gradient's canvas
     * 
     * @method fillGradient
     * @private
     * @chainable
     */
    ColorSelector.prototype.fillGradient = function(){
        var context = this.gradient.canvas.get(0).getContext('2d'),
            fill;

        // Create color gradient
        fill = context.createLinearGradient(0, 0, context.canvas.width, 0);
        fill.addColorStop(0, "rgb(255, 0, 0)");
        fill.addColorStop(0.15, "rgb(255, 0, 255)");
        fill.addColorStop(0.33, "rgb(0, 0, 255)");
        fill.addColorStop(0.49, "rgb(0, 255, 255)");
        fill.addColorStop(0.67, "rgb(0, 255, 0)");
        fill.addColorStop(0.84, "rgb(255, 255, 0)");
        fill.addColorStop(1, "rgb(255, 0, 0)");

        // Apply gradient to canvas
        context.fillStyle = fill;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        // Create semi transparent gradient (white -> trans. -> black)
        fill = context.createLinearGradient(0, 0, 0, context.canvas.height);
        fill.addColorStop(0, "rgba(255, 255, 255, 1)");
        fill.addColorStop(0.5, "rgba(255, 255, 255, 0)");
        fill.addColorStop(0.5, "rgba(0, 0, 0, 0)");
        fill.addColorStop(1, "rgba(0, 0, 0, 1)");

        // Apply gradient to canvas
        context.fillStyle = fill;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        return this;
    };

    /**
     * Fill the previous color indicator canvas
     * 
     * @method fillPrevious
     * @private
     * @chainable
     */
    ColorSelector.prototype.fillPrevious = function(){
        var context = this.controls.previous.get(0).getContext('2d');

        context.fillStyle = "rgba("+ this.previous_value.r +","+ this.previous_value.g +","+ this.previous_value.b +","+ this.previous_value.a +")";
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        return this;
    };

    /**
     * Fill the current color indicator canvas
     * 
     * @method fillCurrent
     * @private
     * @chainable
     */
    ColorSelector.prototype.fillCurrent = function(){
        var context = this.controls.current.get(0).getContext('2d');

        context.fillStyle = "rgba("+ this.value.r +","+ this.value.g +","+ this.value.b +","+ this.value.a +")";
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        return this;
    };

    /**
     * Fill the alpha indicator canvas
     * 
     * @method fillAlpha
     * @private
     * @chainable
     */
    ColorSelector.prototype.fillAlpha = function(){
        var context = this.alpha.canvas.get(0).getContext('2d'),
            fill;

        // Create color gradient
        fill = context.createLinearGradient(0, 0, 0, context.canvas.height);
        fill.addColorStop(0, "rgb("+ this.value.r +","+ this.value.g +","+ this.value.b +")");
        fill.addColorStop(1, "transparent");

        // Apply gradient to canvas
        context.fillStyle = fill;
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        return this;
    };

    /**
     * The controls input event handler
     * 
     * @method onControlInput
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onControlInput = function(evt){
        var rgba, hsv;

        this.updateValue({
            'r': this.controls.r.val(),
            'g': this.controls.g.val(),
            'b': this.controls.b.val(),
            'a': this.controls.a.val()
        }, true, true, false);
    };

    /**
     * The gradient mousedown event handler
     * 
     * @method onGradientMousedown
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onGradientMousedown = function(evt){
        this.gradient.canvas.addListener('mousemove', this.onGradientMousemove);

        evt.stopPropagation();
    };

    /**
     * The gradient mouseup event handler
     * 
     * @method onGradientMouseup
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onGradientMouseup = function(evt){
        this.gradient.canvas.removeListener('mousemove', this.onGradientMousemove);

        evt.stopPropagation();
    };

    /**
     * The gradient click event handler
     * 
     * @method onGradientClick
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onGradientClick = function(evt){
        var offset = evt.target.getBoundingClientRect(),
            colorX = evt.pageX - offset.left,
            colorY = evt.pageY - offset.top,
            context = this.gradient.canvas.get(0).getContext('2d'),
            imageData = context.getImageData(colorX, colorY, 1, 1),
            value = this.value;

        this.gradient.position.css('left', colorX +'px');
        this.gradient.position.css('top', colorY +'px');

        value.r = imageData.data[0];
        value.g = imageData.data[1];
        value.b = imageData.data[2];

        if(!value.a){
            value.a = 1;
            this.updateValue(value, true, true);
        }
        else{
            this.updateValue(value, true, false);
        }


        evt.stopPropagation();
    };

    /**
     * The gradient mousemove event handler
     * 
     * @method onGradientMousemove
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onGradientMousemove = ColorSelector.prototype.onGradientClick;

    /**
     * The alpha mousedown event handler
     * 
     * @method onAlphaMousedown
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onAlphaMousedown = function(evt){
        this.alpha.canvas.addListener('mousemove', this.onAlphaMousemove);

        evt.stopPropagation();
    };

    /**
     * The alpha mouseup event handler
     * 
     * @method onAlphaMouseup
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onAlphaMouseup = function(evt){
        this.alpha.canvas.removeListener('mousemove', this.onAlphaMousemove);

        evt.stopPropagation();
    };

    /**
     * The alpha click event handler
     * 
     * @method onAlphaClick
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onAlphaClick = function(evt){
        var offset = evt.target.getBoundingClientRect(),
            colorY = evt.pageY - offset.top,
            context = this.alpha.canvas.get(0).getContext('2d'),
            imageData = context.getImageData(0, colorY, 1, 1),
            value = this.value;

        this.alpha.position.css('top', colorY +'px');

        value.a = Math.round(imageData.data[3] / 255 * 100) / 100;

        this.updateValue(value, false, false);

        evt.stopPropagation();
    };

    /**
     * The alpha mousemove event handler
     * 
     * @method onAlphaClick
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onAlphaMousemove = ColorSelector.prototype.onAlphaClick;

    /**
     * The apply button click event handler
     * 
     * @method onApplyClick
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onApplyClick = function(evt){
        this.triggerEvent(EVT_SUBMIT, {'overlay': this, 'value': this.value}, true, false);

        this.hide();
    };

    /**
     * The cancel button click event handler
     * 
     * @method onCancelClick
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onCancelClick = function(evt){
        this.hide();
    };

    return ColorSelector;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').GuideDetails = (function () {

    /**
     * Fired when the submit button is clicked
     *
     * @event submit
     * @param {Object} overlay The overlay instance
     * @param {Object} values The field values
     */
    var EVT_SUBMIT = 'submit';

    /**
     * An overlay to update a guide's details (title, description, thumbnail, etc)
     *
     * @class GuideDetails
     * @namespace editor.overlay
     * @extends Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.parent='.metaScore-editor'] The parent element in which the overlay will be appended
     * @param {Boolean} [configs.toolbar=true] Whether to show a toolbar with a title and close button
     * @param {String} [configs.title='Guide Info'] The overlay's title
     * @param {Object} [configs.groups={}] The groups the user belongs to
     * @param {String} [configs.submit_text='Save'] The overlay's submit button label
     */
    function GuideDetails(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        GuideDetails.parent.call(this, this.configs);

        this.changed = {};
        this.previous_values = null;

        this.addClass('guide-details');
    }

    GuideDetails.defaults = {
        'parent': '.metaScore-editor',
        'toolbar': true,
        'title': metaScore.Locale.t('editor.overlay.GuideDetails.title', 'Guide Info'),
        'groups': {},
        'submit_text': metaScore.Locale.t('editor.overlay.GuideDetails.submitText', 'Save')
    };

    metaScore.Overlay.extend(GuideDetails);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    GuideDetails.prototype.setupUI = function(){
        var contents, form;

        // call parent method
        GuideDetails.parent.prototype.setupUI.call(this);

        contents = this.getContents();

        this.fields = {};

        form = new metaScore.Dom('<form>')
            .addListener('submit', metaScore.Function.proxy(this.onFormSubmit, this))
            .appendTo(contents);

        // Fields
        this.fields['type'] = new metaScore.editor.field.Select({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.type.label', 'Type'),
                'options': [
                    {
                        'value': '',
                        'text': ''
                    },
                    {
                        'value': 'audio',
                        'text': metaScore.Locale.t('editor.overlay.GuideDetails.fields.type.options.audio', 'Audio')
                    },
                    {
                        'value': 'video',
                        'text': metaScore.Locale.t('editor.overlay.GuideDetails.fields.type.options.video', 'Video')
                    }
                ],
                'required': true
            })
            .data('name', 'type')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['title'] = new metaScore.editor.field.Text({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.title.label', 'Title'),
                'required': true
            })
            .data('name', 'title')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['description'] = new metaScore.editor.field.Textarea({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.description.label', 'Description')
            })
            .data('name', 'description')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['credits'] = new metaScore.editor.field.Textarea({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.credits.label', 'Credits')
            })
            .data('name', 'credits')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['thumbnail'] = new metaScore.editor.field.File({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.thumbnail.label', 'Thumbnail'),
                'description': metaScore.Locale.t('editor.overlay.GuideDetails.fields.thumbnail.description', 'Prefered dimensions: !dimentions pixels<br/>Allowed file types: !types', {'!dimentions': '155x123', '!types': 'png gif jpg jpeg'}),
                'accept': '.png,.gif,.jpg,.jpeg'
            })
            .data('name', 'thumbnail')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['media'] = new metaScore.editor.field.File({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.media.label', 'Media'),
                'description': metaScore.Locale.t('editor.overlay.GuideDetails.fields.media.description', 'Allowed file types: !types', {'!types': 'mp4 m4v m4a mp3'}),
                'accept': '.mp4,.m4v,.m4a,.mp3',
                'required': true
            })
            .data('name', 'media')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['css'] = new metaScore.editor.field.Textarea({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.css.label', 'CSS')
            })
            .data('name', 'css')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['tags'] = new metaScore.editor.field.Text({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.tags.label', 'Tags'),
                'description': metaScore.Locale.t('editor.overlay.GuideDetails.fields.tags.description', 'Comma separated list of tags'),
            })
            .data('name', 'tags')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);
        
        if(!metaScore.Var.isEmpty(this.configs.groups)){
            this.fields['groups'] = new metaScore.editor.field.Checkboxes({
                    'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.groups.label', 'Groups'),
                    'description': metaScore.Locale.t('editor.overlay.GuideDetails.fields.groups.description', 'The checked groups are those in which this guide is shared'),
                    'multiple': true
                })
                .data('name', 'groups')
                .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
                .appendTo(form);
                
            metaScore.Array.each(this.configs.groups, function(index, group){
                this.fields['groups'].addCheckbox(group.id, group.title);
            }, this);
        }

        // Buttons
        new metaScore.Button({'label': this.configs.submit_text})
            .addClass('submit')
            .appendTo(form);

        new metaScore.Button({'label': metaScore.Locale.t('editor.overlay.GuideDetails.buttons.cancel.label', 'Cancel')})
            .addClass('cancel')
            .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
            .appendTo(form);

        // Information
        new metaScore.Dom('<div/>', {'class': 'info', 'text': metaScore.Locale.t('editor.overlay.GuideDetails.info', 'The guide needs to be saved in order for applied changes to become permanent')})
            .appendTo(form);
    };

    /**
     * Get a field by name
     * 
     * @method getField
     * @param {String} name The field's name
     * @return {editor.Field} The field object
     */
    GuideDetails.prototype.getField = function(name){
        var fields = this.fields;

        if(name){
            return fields[name];
        }

        return fields;
    };

    /**
     * Set the field values
     * 
     * @method setValues
     * @param {Object} values A list of field values in name/value pairs
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    GuideDetails.prototype.setValues = function(values, supressEvent){
        metaScore.Object.each(values, function(name, value){
            var field;
            
            if(name in this.fields){
                field = this.fields[name];
                
                if(name === 'shared_with'){
                    field.clear();
                    
                    if(values['available_groups']){
                        metaScore.Object.each(values['available_groups'], function(gid, group_name){
                            field.addOption(gid, group_name);
                        });
                    }
                }
                
                field.setValue(value, supressEvent);
            }
        }, this);

        this.previous_values = values;

        return this;
    };

    /**
     * Clears all field values
     * 
     * @method clearValues
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    GuideDetails.prototype.clearValues = function(supressEvent){
        metaScore.Object.each(this.fields, function(name, field){
            field.setValue(null, supressEvent);
        }, this);

        return this;
    };

    /**
     * Get all changed field values
     * 
     * @method getValues
     * @return {Object} The values of changed fields in name/value pairs
     */
    GuideDetails.prototype.getValues = function(){
        return metaScore.Object.extend({}, this.changed);
    };

    /**
     * The fields change event handler
     * 
     * @method onFieldValueChange
     * @private
     * @param {Event} evt The event object
     */
    GuideDetails.prototype.onFieldValueChange = function(evt){
        var field = evt.detail.field,
            value = evt.detail.value,
            name = field.data('name'),
            file;

        if(field instanceof metaScore.editor.field.File){
            if(file = field.getFile(0)){
                this.changed[name] = {
                    'name': file.name,
                    'url': URL.createObjectURL(file),
                    'mime': file.type,
                    'object': file
                };
            }
            else{
                delete this.changed[name];
            }
        }
        else{
            this.changed[name] = value;
        }
    };

    /**
     * The form submit event handler
     * 
     * @method onFormSubmit
     * @private
     * @param {Event} evt The event object
     */
    GuideDetails.prototype.onFormSubmit = function(evt){
        this.triggerEvent(EVT_SUBMIT, {'overlay': this, 'values': this.getValues()}, true, false);

        evt.preventDefault();
        evt.stopPropagation();
    };

    /**
     * The close button click event handler
     * 
     * @method onCloseClick
     * @private
     * @param {Event} evt The event object
     */
    GuideDetails.prototype.onCloseClick = function(evt){
        if(this.previous_values){
            this.clearValues(true)
                .setValues(this.previous_values, true);
        }

        this.hide();

        evt.preventDefault();
    };

    /**
     * The cancel button click event handler
     * 
     * @method onCancelClick
     * @private
     * @param {Event} evt The event object
     */
    GuideDetails.prototype.onCancelClick = GuideDetails.prototype.onCloseClick;

    return GuideDetails;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').GuideSelector = (function () {

    /**
     * Fired when a guide's select button is clicked
     *
     * @event submit
     * @param {Object} overlay The overlay instance
     * @param {Object} guide The guide's data
     * @param {Integer} vid The selected vid of the guide
     */
    var EVT_SUBMIT = 'submit';

    /**
     * A guide selector overlay
     *
     * @class GuideSelector
     * @namespace editor.overlay
     * @extends Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.parent='.metaScore-editor'] The parent element in which the overlay will be appended
     * @param {Boolean} [configs.toolbar=true] Whether to show a toolbar with a title and close button
     * @param {String} [configs.title='Select a guide'] The overlay's title
     * @param {String} [configs.empty_text='No guides available'] A text to show when no guides are available
     * @param {String} [configs.url=''] The url from which to retreive the list of guides
     */
    function GuideSelector(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        GuideSelector.parent.call(this, this.configs);

        this.addClass('guide-selector');
    }

    GuideSelector.defaults = {
        'parent': '.metaScore-editor',
        'toolbar': true,
        'title': metaScore.Locale.t('editor.overlay.GuideSelector.title', 'Select a guide'),
        'empty_text': metaScore.Locale.t('editor.overlay.GuideSelector.emptyText', 'No guides available'),
        'url': null
    };

    metaScore.Overlay.extend(GuideSelector);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    GuideSelector.prototype.setupUI = function(){
        var contents, fieldset, buttons;
        
        GuideSelector.parent.prototype.setupUI.call(this);
        
        contents = this.getContents();

        this.filters_form = new metaScore.Dom('<form/>', {'class': 'filters', 'method': 'GET'})
            .addListener('submit', metaScore.Function.proxy(this.onFilterFormSubmit, this))
            .appendTo(contents);
            
        fieldset = new metaScore.editor.Fieldset({
                'legend_text': metaScore.Locale.t('editor.overlay.GuideSelector.filters.fieldset.legend', 'Search'),
                'collapsible': true,
                'collapsed': true
            })
            .appendTo(this.filters_form)
            .getContents();
        
        this.filter_fields = {};
        
        this.filter_fields['fulltext'] = new metaScore.editor.field.Text({
                'label': metaScore.Locale.t('editor.overlay.GuideSelector.filters.fulltext.label', 'Full-text search'),
                'description': metaScore.Locale.t('editor.overlay.GuideSelector.filters.fulltext.description', "Search in the guide's title, credits, description and blocks")
            })
            .data('name', 'filters[fulltext]')
            .appendTo(fieldset);
            
        this.filter_fields['tag'] = new metaScore.editor.field.Select({
                'label': metaScore.Locale.t('editor.overlay.GuideSelector.filters.tag.label', 'Tag'),
                'value': ''
            })
            .data('name', 'filters[tag]')
            .appendTo(fieldset);
            
        this.filter_fields['author'] = new metaScore.editor.field.Select({
                'label': metaScore.Locale.t('editor.overlay.GuideSelector.filters.author.label', "Guide's author"),
                'value': ''
            })
            .data('name', 'filters[author]')
            .appendTo(fieldset);
            
        this.filter_fields['group'] = new metaScore.editor.field.Select({
                'label': metaScore.Locale.t('editor.overlay.GuideSelector.filters.group.label', 'Group'),
                'value': ''
            })
            .data('name', 'filters[group]')
            .appendTo(fieldset);
            
        this.filter_fields['status'] = new metaScore.editor.field.Select({
                'label': metaScore.Locale.t('editor.overlay.GuideSelector.filters.status.label', 'Status'),
                'options': [
                    {
                        'value': '',
                        'text': ''
                    },
                    {
                        'value': '1',
                        'text': metaScore.Locale.t('editor.overlay.GuideSelector.filters.status.published.lable', 'Published')
                    },
                    {
                        'value': '0',
                        'text': metaScore.Locale.t('editor.overlay.GuideSelector.filters.status.unpublished.lable', 'Unpublished')
                    }
                ],
                'value': ''
            })
            .data('name', 'filters[status]')
            .appendTo(fieldset);
            
        this.filter_fields['sort_by'] = new metaScore.editor.field.Select({
                'label': metaScore.Locale.t('editor.overlay.GuideSelector.filters.sort_by.label', 'Sort by'),
                'options': [
                    {
                        'value': 'title',
                        'text': metaScore.Locale.t('editor.overlay.GuideSelector.filters.sort_by.title.lable', 'Title')
                    },
                    {
                        'value': 'created',
                        'text': metaScore.Locale.t('editor.overlay.GuideSelector.filters.sort_by.created.lable', 'Creation date')
                    },
                    {
                        'value': 'changed',
                        'text': metaScore.Locale.t('editor.overlay.GuideSelector.filters.sort_by.changed.lable', 'Last update date')
                    }
                ],
                'value': 'changed'
            })
            .data('name', 'sort_by')
            .appendTo(fieldset);
            
        this.filter_fields['sort_order'] = new metaScore.editor.field.Select({
                'label': metaScore.Locale.t('editor.overlay.GuideSelector.filters.sort_order.label', 'Order'),
                'options': [
                    {
                        'value': 'ASC',
                        'text': metaScore.Locale.t('editor.overlay.GuideSelector.filters.sort_order.asc.lable', 'Asc')
                    },
                    {
                        'value': 'DESC',
                        'text': metaScore.Locale.t('editor.overlay.GuideSelector.filters.sort_order.desc.lable', 'Desc')
                    }
                ],
                'value': 'DESC'
            })
            .data('name', 'sort_order')
            .appendTo(fieldset);
            
        buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .appendTo(fieldset);
            
        new metaScore.Button({'label': metaScore.Locale.t('editor.overlay.GuideSelector.filters.submit.label', 'Submit')})
            .addClass('submit')
            .appendTo(buttons);

        new metaScore.Button({'label': metaScore.Locale.t('editor.overlay.GuideSelector.filters.reset.label', 'Reset')})
            .addClass('reset')
            .addListener('click', metaScore.Function.proxy(this.onFiltersResetClick, this))
            .appendTo(buttons);
            
        this.results = new metaScore.Dom('<table/>', {'class': 'results'})
            .appendTo(contents);
    };

    /**
     * Show the overlay
     * 
     * @method show
     * @chainable
     */
    GuideSelector.prototype.show = function(){
        GuideSelector.parent.prototype.show.call(this);
        
        this.load(true);

        return this;
    };

    /**
     * The onload success event handler
     * 
     * @method onLoadSuccess
     * @private
     * @param {XMLHttpRequest} xhr The <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest" target="_blank">XMLHttpRequest</a> object
     */
    GuideSelector.prototype.onLoadSuccess = function(xhr){
        var data = JSON.parse(xhr.response);
        
        if('filters' in data){
            metaScore.Object.each(data['filters'], function(field, values){
                if(field in this.filter_fields){
                    this.filter_fields[field].clear().addOption('', '');
                
                    metaScore.Object.each(values, function(key, value){
                        this.filter_fields[field].addOption(key, value);
                    }, this);
                }
            }, this);
        }
        
        this.setupResults(data['items']);

        this.loadmask.hide();
        delete this.loadmask;
    };

    /**
     * The load error event handler
     * 
     * @method onLoadError
     * @private
     * @param {XMLHttpRequest} xhr The <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest" target="_blank">XMLHttpRequest</a> object
     */
    GuideSelector.prototype.onLoadError = function(xhr){
    };

    /**
     * The filter form submit event handler
     * 
     * @method onFilterFormSubmit
     * @private
     * @param {Event} evt The event object
     */
    GuideSelector.prototype.onFilterFormSubmit = function(evt){
        this.load();
    
        evt.preventDefault();
        evt.stopPropagation();
    };

    /**
     * The filters reset button click event handler
     * 
     * @method onFiltersResetClick
     * @private
     * @param {Event} evt The event object
     */
    GuideSelector.prototype.onFiltersResetClick = function(evt){
        metaScore.Object.each(this.filter_fields, function(key, field){
            field.reset();
        });
    };

    /**
     * Setup the results
     * 
     * @method setupResults
     * @private
     * @chainable
     */
    GuideSelector.prototype.setupResults = function(guides){
        var row,
            revision_wrapper, revision_field, last_vid,
            groups, button;
            
        this.results.empty();
        
        if(metaScore.Var.isEmpty(guides)){
            this.results.text(this.configs.empty_text);
        }
        else{
            metaScore.Array.each(guides, function(index, guide){
                if(!(guide.permissions.update || guide.permissions.clone)){
                    return;
                }
                
                row = new metaScore.Dom('<tr/>', {'class': 'guide-'+ guide.id})
                    .appendTo(this.results);

                new metaScore.Dom('<td/>', {'class': 'thumbnail'})
                    .append(new metaScore.Dom('<img/>', {'src': guide.thumbnail ? guide.thumbnail.url : null}))
                    .appendTo(row);

                revision_field = new metaScore.editor.field.Select({
                        'label': metaScore.Locale.t('editor.overlay.GuideSelector.revisionLabel', 'Version')
                    })
                    .addClass('revisions');

                if('revisions' in guide){
                    groups = {};

                    metaScore.Object.each(guide.revisions, function(vid, revision){
                        var group_id, group_label, group, text;

                        switch(revision.state){
                            case 0: // archives
                                group_id = 'archives';
                                group_label = metaScore.Locale.t('editor.overlay.GuideSelector.archivesGroup', 'archives');
                                break;

                            case 1: // published
                                group_id = 'published';
                                group_label = metaScore.Locale.t('editor.overlay.GuideSelector.publishedGroup', 'published');
                                break;

                            case 2: // drafts
                                group_id = 'drafts';
                                group_label = metaScore.Locale.t('editor.overlay.GuideSelector.draftsGroup', 'drafts');
                                break;
                        }

                        if(!(group_id in groups)){
                            groups[group_id] = revision_field.addGroup(group_label).addClass(group_id);
                        }

                        group = groups[group_id];

                        text = metaScore.Locale.t('editor.overlay.GuideSelector.revisionText', '!date by !author (!id:!vid)', {'!date': revision.date, '!author': revision.author, '!id': guide.id, '!vid': vid});

                        revision_field.addOption(vid, text, group);
                    });

                    if('latest_revision' in guide){
                        revision_field.setValue(guide.latest_revision);
                    }
                }
                else{
                    revision_field.disable();
                }

                button = new metaScore.Button()
                    .addClass('submit')
                    .setLabel(metaScore.Locale.t('editor.overlay.GuideSelector.button', 'Select'))
                    .addListener('click', metaScore.Function.proxy(function(guide, revision_field, evt){
                        this.triggerEvent(EVT_SUBMIT, {'overlay': this, 'guide': guide, 'vid': revision_field.getValue()}, true, false);

                        this.hide();

                        evt.stopPropagation();
                    }, this, [guide, revision_field]))
                    .data('action', 'select');

                revision_wrapper = new metaScore.Dom('<div/>', {'class': 'revision-wrapper'})
                    .append(revision_field)
                    .append(button);

                new metaScore.Dom('<td/>', {'class': 'details'})
                    .append(new metaScore.Dom('<h1/>', {'class': 'title', 'text': guide.title}))
                    .append(new metaScore.Dom('<p/>', {'class': 'description', 'text': guide.description}))
                    .append(new metaScore.Dom('<p/>', {'class': 'tags', 'text': metaScore.Locale.t('editor.overlay.GuideSelector.tagsText', 'tags: <em>!tags</em>', {'!tags': guide.tags})}))
                    .append(new metaScore.Dom('<p/>', {'class': 'author', 'text': metaScore.Locale.t('editor.overlay.GuideSelector.authorText', 'created by <em>!author</em>', {'!author': guide.author})}))
                    .append(revision_wrapper)
                    .appendTo(row);
            }, this);
        }
            
        return this;
    };

    /**
     * Load guides
     * 
     * @method load
     * @private
     * @chainable
     */
    GuideSelector.prototype.load = function(initial){
        var data = {};
        
        metaScore.Object.each(this.filter_fields, function(key, field){
            data[field.data('name')] = field.getValue();
        });
        
        if(initial === true){
            data['with_filter_options'] = true;
        }
        
        this.loadmask = new metaScore.overlay.LoadMask({
            'parent': this.getContents(),
            'autoShow': true
        });

        metaScore.Ajax.get(this.configs.url, {
            'data': data,
            'dataType': 'json',
            'success': metaScore.Function.proxy(this.onLoadSuccess, this),
            'error': metaScore.Function.proxy(this.onLoadError, this)
        });
    };

    return GuideSelector;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').Share = (function () {

    /**
     * An overlay to share a guide
     *
     * @class Share
     * @namespace editor.overlay
     * @extends Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.parent='.metaScore-editor'] The parent element in which the overlay will be appended
     * @param {Boolean} [configs.toolbar=true] Whether to show a toolbar with a title and close button
     * @param {String} [configs.title='Guide Info'] The overlay's title
     * @param {String} [configs.url=''] The player's url
     * @param {String} [configs.api_help_url=''] The player's api help url
     */
    function Share(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Share.parent.call(this, this.configs);

        this.addClass('share');
        
        this.getField('link').setValue(this.configs.url);
        this.getField('embed').setValue(this.getEmbedCode());
    }

    Share.defaults = {
        'parent': '.metaScore-editor',
        'toolbar': true,
        'title': metaScore.Locale.t('editor.overlay.Share.title', 'Share'),
        'url': '',
        'api_help_url': ''
    };

    metaScore.Overlay.extend(Share);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    Share.prototype.setupUI = function(){
        var contents,
            options_wrapper, options_toggle_id, options;

        // call parent method
        Share.parent.prototype.setupUI.call(this);

        contents = this.getContents();

        this.fields = {};

        // Link
        this.fields['link'] = new metaScore.editor.field.Text({
                'label': metaScore.Locale.t('editor.overlay.Share.fields.link.label', 'Link'),
                'readonly': true
            })
            .data('name', 'link')
            .addListener('click', function(evt){
                evt.target.focus();
                evt.target.select();
            })
            .appendTo(contents);

        // Embed
        this.fields['embed'] = new metaScore.editor.field.Textarea({
                'label': metaScore.Locale.t('editor.overlay.Share.fields.embed.label', 'Embed'),
                'readonly': true
            })
            .data('name', 'embed')
            .addListener('click', function(evt){
                evt.target.focus();
                evt.target.select();
            })
            .appendTo(contents);
            
        // Embed options
        options_wrapper = new metaScore.Dom('<div>', {'class': 'collapsible'})
            .appendTo(contents);
        
        options_toggle_id = 'toggle-'+ metaScore.String.uuid(5);
        new metaScore.Dom('<input>', {'type': 'checkbox', 'id': options_toggle_id})
            .data('role', 'collapsible-toggle')
            .appendTo(options_wrapper);
        
        new metaScore.Dom('<label>', {'text': metaScore.Locale.t('editor.overlay.Share.options.label', 'Embed options'), 'for': options_toggle_id})
            .data('role', 'collapsible-label')
            .appendTo(options_wrapper);
            
        options = new metaScore.Dom('<div>', {'class': 'options'})
            .data('role', 'collapsible')
            .appendTo(options_wrapper);

        this.fields['width'] = new metaScore.editor.field.Text({
                'label': metaScore.Locale.t('editor.overlay.Share.fields.width.label', 'Width'),
                'value': '100%'
            })
            .data('name', 'width')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(options);
            
        this.fields['height'] = new metaScore.editor.field.Text({
                'label': metaScore.Locale.t('editor.overlay.Share.fields.height.label', 'Height'),
                'value': '100%'
            })
            .data('name', 'height')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(options);

        this.fields['keyboard'] = new metaScore.editor.field.Checkbox({
                'label': metaScore.Locale.t('editor.overlay.Share.fields.keyboard.label', 'Enable keyboard shortcuts')
            })
            .data('name', 'keyboard')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(options);

        this.fields['api'] = new metaScore.editor.field.Checkbox({
                'label': metaScore.Locale.t('editor.overlay.Share.fields.api.label', 'Enable controlling the player through the <a href="!url" target="_blank">JavaScript API</a>', {'!url': this.configs.api_help_url})
            })
            .data('name', 'api')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(options);
    };

    /**
     * Get a field by name
     * 
     * @method getField
     * @param {String} name The field's name
     * @return {editor.Field} The field object
     */
    Share.prototype.getField = function(name){
        var fields = this.fields;

        if(name){
            return fields[name];
        }

        return fields;
    };

    /**
     * The fields change event handler
     * 
     * @method onFieldValueChange
     * @private
     * @param {Event} evt The event object
     */
    Share.prototype.onFieldValueChange = function(evt){
        this.getField('embed').setValue(this.getEmbedCode());
    };

    /**
     * Construct and retur the embed code
     * 
     * @method getEmbedCode
     * @private
     * @return {String} The embed code
     */
    Share.prototype.getEmbedCode = function(){
        var width = this.getField('width').getValue(),
            height = this.getField('height').getValue(),
            keyboard = this.getField('keyboard').getValue(),
            api = this.getField('api').getValue(),
            url = this.configs.url,
            query = [];
        
        if(keyboard){
            query.push('keyboard=1');
        }
        
        if(api){
            query.push('api=1');
        }
        
        if(query.length > 0 ){
            url += '?' + query.join('&');
        }
            
        return metaScore.Locale.formatString('<iframe type="text/html" src="!url" width="!width" height="!height" frameborder="0" allowfullscreen="true" class="metascore-embed"></iframe>', {
            '!url': url,
            '!width': width,
            '!height': height
        });
    };

    return Share;

})();
    // attach the metaScore object to the global scope
    global.metaScore = metaScore;

} (this));