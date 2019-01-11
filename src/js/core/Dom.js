import {isArray, isString, isObject, isFunction} from './utils/Var';
import {capitalize} from './utils/String';

/**
 * Regular expression that matches dashed string for camelizing
 *
 * @property camelRe
 * @private
 */
const camelRe = /-([\da-z])/gi;

/**
 * List of common events that should generaly bubble up
 *
 * @property bubbleEvents
 * @private
 */
const bubbleEvents = {
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
 * A class for Dom manipulation
 *
 * @emits {beforeremove} Fired before an element is removed
 * @emits {childremove} Fired when a child element is removed
 * @param {Object} child The removed child
 * @example
 *     var div = new Dom('<div/>', {'class': 'my-class'});
 *     var body = new Dom('body');
 */
export default class Dom {

    /**
     * Instantiate
     *
     * @param {Mixed} [...args] An HTML string and an optional list of attributes to apply, or a CSS selector with an optional parent and an optional list of attributes to apply
     */
    constructor(...args) {

        /**
         * The list of elements
         * @type {Array}
         */
        this.elements = [];

        if(args.length > 0){
            let elements = Dom.elementsFromString(...args);
            if(elements){
                this.add(elements);

                if(args.length > 1){
                    this.attr(args[1]);
                }
            }
            else{
                elements = Dom.selectElements(...args);
                if(elements){
                    this.add(elements);

                    if(args.length > 2){
                        this.attr(args[2]);
                    }
                }
            }
        }
    }

    /**
     * Helper function used by the camel function
     *
     * @private
     * @param {The matched substring} match
     * @param {The submatched letter} letter
     * @return {String} The uppercased letter
     */
    static camelReplaceFn(match, letter) {
        return letter.toUpperCase();
    }

    /**
     * Normalize a string to Camel Case
     *
     * @private
     * @param {String} str The string to normalize
     * @return {String} The normalized string
     */
    static camel(str){
        return str.replace(camelRe, Dom.camelReplaceFn);
    }

    /**
     * Select a single element by CSS selecor and optional parent
     *
     * @param {String} selector The CSS selector
     * @param {HTMLElement} [parent=document] The HTML Element in which to search
     * @return {HTMLElement} The found element if any
     */
    static selectElement(selector, parent) {
        const _parent = parent || document;
        let element = null;

        if (isString(selector)) {
            element = _parent.querySelector(selector);
        }
        else if (selector.length) {
            element = selector[0];
        }
        else {
            element = selector;
        }

        return element;
    }

    /**
     * Select multiple elements by CSS selecor and optional parent
     *
     * @param {String} selector The CSS selector
     * @param {HTMLElement} [parent=document] The HTML Element in which to search
     * @return {Mixed} An HTML NodeList or an array of found elements if any
     */
    static selectElements(selector, parent) {
        let elements = [];

        if(typeof selector !== "undefined"){
            let _parent = parent || document;

            if(_parent instanceof Dom){
                _parent = _parent.get(0);
            }

            if(isString(selector)) {
                elements = _parent.querySelectorAll(selector);
            }
            else if('length' in selector) {
                elements = selector;
            }
            else {
                elements = [selector];
            }
        }

        return elements;
    }

    /**
     * Creates elements from an HTML string
     *
     * @param {String} html The HTML string
     * @return {HTML NodeList} A NodeList of the created elements, or null on error
     */
    static elementsFromString(html){
        if(isString(html)){
            const template = document.createElement('template');
            template.innerHTML = html.trim();

            if(template.content.childElementCount > 0){
                return template.content.childNodes;
            }
        }

        return null;
    }

    /**
     * Get the document containing an element
     *
     * @param {HTMLElement} element The element
     * @return {HTML Document } The document
     */
    static getElementDocument(element){
        return element.ownerDocument || null;
    }

    /**
     * Get the window containing an element
     *
     * @param {HTMLElement} element The element
     * @return {HTML Window} The window
     */
    static getElementWindow(element){
        const doc = this.getElementDocument(element);

        return doc ? (doc.defaultView || doc.parentWindow) : null;
    }

    /**
     * Check if an element has a given CSS lass
     *
     * @param {HTMLElement} element The element
     * @param {String} className The CSS class
     * @return {Boolean} Whether the element has the specified CSS class
     */
    static hasClass(element, className){
        return element.classList.contains(className);
    }

    /**
     * Add a CSS class to an element
     *
     * @param {HTMLElement} element The element
     * @param {String} className The CSS class(es)
     */
    static addClass(element, className){
        const classes = className.split(" ");
        element.classList.add(...classes);
    }

    /**
     * Remove a CSS class from an element
     *
     * @param {HTMLElement} element The element
     * @param {String} className The CSS class(es)
     */
    static removeClass(element, className){
        const classes = className.split(" ");
        element.classList.remove(...classes);
    }

    /**
     * Toggle a CSS class on an element
     *
     * @param {HTMLElement} element The element
     * @param {String} className The CSS class
     * @param {Boolean} [force] Whether to add or remove the class. The class is toggled if not specified
     */
    static toggleClass(element, className, force){
        if(typeof force === "undefined"){
            className.split(" ").forEach((cls) => {
                element.classList.toggle(cls);
            });
        }
        // avoid using classList.toggle with a second argument due to a bug in IE 11
        else if(force){
            this.addClass(element, className);
        }
        else{
            this.removeClass(element, className);
        }
    }

    /**
     * Add an event listener on an element
     *
     * @param {HTMLElement} element The element
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @return {HTMLElement} The element
     */
    static addListener(element, type, callback, useCapture){
        let _useCapture = useCapture;

        if(typeof _useCapture === "undefined"){
            _useCapture = ('type' in bubbleEvents) ? bubbleEvents[type] : false;
        }

        element.addEventListener(type, callback, _useCapture);

        return element;
    }

    /**
     * Add an event listener that only executes once on an element
     *
     * @param {HTMLElement} element The element
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @return {HTMLElement} The element
     */
    static addOneTimeListener(element, type, callback, useCapture){
        let _useCapture = useCapture;

        if(typeof _useCapture === "undefined"){
            _useCapture = ('type' in bubbleEvents) ? bubbleEvents[type] : false;
        }

        const handler = function(evt){
            element.removeEventListener(type, handler, _useCapture);
            return callback(evt);
        };

        element.addEventListener(type, handler, _useCapture);

        return element;
    }

    /**
     * Remove an event listener from an element
     *
     * @param {HTMLElement} element The element
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @return {HTMLElement} The element
     */
    static removeListener(element, type, callback, useCapture){
        let _useCapture = useCapture;

        if(typeof _useCapture === "undefined"){
            _useCapture = ('type' in bubbleEvents) ? bubbleEvents[type] : false;
        }

        element.removeEventListener(type, callback, _useCapture);

        return element;
    }

    /**
     * Trigger an event from an element
     *
     * @param {HTMLElement} element The element
     * @param {String} type The event type
     * @param {Object} [data] Custom data to send with the event. The data is accessible through the event.detail property
     * @param {Boolean} [bubbles=true] Whether the event bubbles up through the DOM or not
     * @param {Boolean} [cancelable=true] Whether the event is cancelable
     * @return {Boolean} Whether the event was not cancelled
     */
    static triggerEvent(element, type, data, bubbles, cancelable){
        const fn = CustomEvent || this.getElementWindow(element).CustomEvent;

        const event = new fn(type, {
            'detail': data,
            'bubbles': bubbles !== false,
            'cancelable': cancelable !== false
        });

        return element.dispatchEvent(event);
    }

    /**
     * Set or get the innerHTML of an element
     *
     * @param {HTMLElement} element The element
     * @param {String} [html] The value to set
     * @return {String} The innerHTML of the element
     */
    static text(element, html){
        if(typeof html !== "undefined"){
            element.innerHTML = html;
        }

        return element.innerHTML;
    }

    /**
     * Set or get the value of an element
     *
     * @param {HTMLElement} element The element
     * @param {String} [value] The value to set
     * @return {String} The value of the element
     */
    static val(element, value){
        // if this is a multi-select element
        if(this.is(element, 'select[multiple]')){
            const values = [];

            if(value){
                const _value = isArray(value) ? value : [value];
                this.selectElements('option', element).forEach((option) => {
                    this.prop(option, 'selected', _value.includes(this.val(option)));
                });
            }

            this.selectElements('option:checked', element).forEach((option) => {
                values.push(this.val(option));
            });

            return values;
        }

        // otherwise
        if(typeof value !== "undefined"){
            element.value = value;
        }
        return element.value;
    }

    /**
     * Set or get an attribute on an element
     *
     * @param {HTMLElement} element The element
     * @param {Mixed} name The attribute's name, or a list of name/value pairs
     * @param {Mixed} [value] The attribute's value
     * @return {Mixed} The attribute's value, nothing is returned for 'special' attributes such as "class" or "text"
     */
    static attr(element, name, value){
        if(isObject(name)){
			Object.entries(name).forEach(([key, val]) => {
                this.attr(element, key, val);
            });
        }
        else{
            switch(name){
                case 'class':
                    this.addClass(element, value);
                    break;

                case 'text':
                    return this.text(element, value);

                default:
                    if(value === null){
                        element.removeAttribute(name);
                    }
                    else{
                        if(typeof value !== "undefined"){
                            element.setAttribute(name, value);
                        }

                        return element.getAttribute(name);
                    }
                    break;
            }
        }

        return null;
    }

    /**
     * Set or get a property on an element
     *
     * @param {HTMLElement} element The element
     * @param {Mixed} name The attribute's name, or a list of name/value pairs
     * @param {Mixed} [value] The attribute's value
     * @return {Mixed} The attribute's value, nothing is returned for 'special' attributes such as "class" or "text"
     * @todo Handle errors
     */
    static prop(element, name, value){
        if(isObject(name)){
			Object.entries(name).forEach(([key, val]) => {
                this.prop(element, key, val);
            });
        }
        else{
            if(value === null){
                try {
                    element[name] = void 0;
                    delete element[name];
                }
                catch(e){
                    //
                }
            }
            else{
                if(typeof value !== "undefined"){
                    element[name] = value;
                }

                return element[name];
            }
        }

        return null;
    }

    /**
     * Set or get a CSS style property of an element
     *
     * @param {HTMLElement} element The element
     * @param {String} name The CSS property's name
     * @param {String} value The CSS property's value
     * @param {Boolean} [inline=false] Whether to return the inline or computed style value
     * @return {String} The CSS style value of the property
     */
    static css(element, name, value, inline){
        const camel = this.camel(name);

        if(typeof value !== "undefined"){
            element.style[camel] = value;
        }

        const style = inline === true ? element.style : window.getComputedStyle(element);
        const new_value = style.getPropertyValue(name);

        return new_value !== "" ? new_value : null;
    }

    /**
     * Set or get a custom data attribute of an element
     *
     * @param {HTMLElement} element The element
     * @param {String} name The name of the data attribute
     * @param {String} value The value of the data attribute
     * @return {String} The value of the data attribute
     */
    static data(element, name, value){
        const camel = this.camel(name);

        if(value === null){
            if(element.dataset[camel]){
                delete element.dataset[camel];
            }
        }
        else if(typeof value !== "undefined"){
            element.dataset[camel] = value;
        }

        return element.dataset[camel];
    }

    /**
     * Append children to an element
     *
     * @param {HTMLElement} element The element
     * @param {Mixed} children An array of elemets or a single element to append
     */
    static append(element, children){
        const _children = isArray(children) ? children : [children];

        _children.forEach((child) => {
            element.appendChild(child);
        });
    }

    /**
     * Insert siblings before an element
     *
     * @param {HTMLElement} element The element
     * @param {Mixed} siblings An array of elemets or a single element to insert
     */
    static before(element, siblings){
        const _siblings = isArray(siblings) ? siblings : [siblings];

        _siblings.forEach((sibling) => {
            element.parentElement.insertBefore(sibling, element);
        });
    }

    /**
     * Insert siblings after an element
     * @param {HTMLElement} element The element
     * @param {Mixed} siblings An array of elemets or a single element to insert
     */
    static after(element, siblings){
        const _siblings = isArray(siblings) ? siblings : [siblings];

        _siblings.forEach((sibling) => {
            element.parentElement.insertBefore(sibling, element.nextSibling);
        });
    }

    /**
     * Remove all element children
     *
     * @param {HTMLElement} element The element
     */
    static empty(element){
        while(element.firstChild){
            element.removeChild(element.firstChild);
        }
    }

    /**
     * Remove an element from the DOM
     *
     * @param {HTMLElement} element The element
     */
    static remove(element){
        if(element.parentElement){
            element.parentElement.removeChild(element);
        }
    }

    /**
     * Check if an element matches a CSS selector
     *
     * @param {HTMLElement} element The element
     * @param {String} selector The CSS selector
     * @return {Boolean} Whether the element matches the CSS selector
     */
    static is(element, selector){
        return element.matches(selector);
    }

    /**
     * Get the closest ancestor of an element which matches a given CSS selector
     *
     * @param {HTMLElement} element The element
     * @param {String} selector The CSS selector
     * @return {Element} The matched element
     */
    static closest(element, selector){
        if(element instanceof Element){
            return Element.prototype.closest.call(element, selector);
        }

        const win = this.getElementWindow(element);
        if(win){
            if(element instanceof win.Element){
                return Element.prototype.closest.call(element, selector);
            }
        }

        return null;
    }

    /**
     * Get the top and left offset of an element
     *
     * @param {HTMLElement} element The element
     * @return {Object} The top and left offset
     */
    static offset(element){
        let el = element;
        let left = 0;
        let top = 0;

        if(el.offsetParent){
            do{
                left += el.offsetLeft;
                top += el.offsetTop;
            }
            while ((el = el.offsetParent));
        }

        return {'left': left, 'top': top};
    }

    /**
     * Add an element to the set of elements managed by the Dom object
     *
     * @private
     * @param {Mixed} elements An array of elements or a single element to add
     */
    add(elements){
        if('length' in elements){
            for(let i = 0; i < elements.length; i++ ) {
                this.elements.push(elements[i]);
            }
        }
        else{
            this.elements.push(elements);
        }
    }

    /**
     * Get the number of elements managed by the Dom object
     *
     * @return {Integer} The number of elements
     */
    count() {
        return this.elements.length;
    }

    /**
     * Get an element by index from the set of elements managed by the Dom object
     *
     * @param {Integer} index The index of the elements to retreive
     * @return {Element} The element
     */
    get(index){
        return this.elements[index];
    }

    /**
     * Return a new Dom object with the elements filtered by a CSS selector
     *
     * @param {String} selector The CSS selector
     * @return {Dom} The new Dom object
     */
    filter(selector){
        const filtered = new Dom();

        this.forEach((element) => {
            if(Dom.is(element, selector)){
                filtered.add(element);
            }
        });

        return filtered;
    }

    /**
     * Get the index of the first element that matched the given CSS selector
     *
     * @param {String} selector The CSS selector
     * @return {Integer} The index of the first matched element, or -1 if none
     */
    index(selector){
        return this.elements.findIndex((element) => {
			return Dom.is(element, selector);
        });
    }

    /**
     * Find all descendents that match a given CSS selector
     *
     * @param {String} selector The CSS selector
     * @return {Dom} A Dom object of all matched descendents
     */
    find(selector){
        const descendents = new Dom();

        this.forEach((element) => {
            descendents.add(Dom.selectElements.call(this, selector, element));
        });

        return descendents;
    }

    /**
     * Get all children, optionally filtered by a given CSS selector
     *
     * @param {String} [selector] The CSS selector
     * @return {Dom} A Dom object of all matched children
     */
    children(selector){
        let children = new Dom();

        this.forEach((element) => {
            children.add(element.children);
        });

        if(selector){
            children = children.filter(selector);
        }

        return children;
    }

    /**
     * Get the first child , optionally filtered by a given CSS selector
     *
     * @param {String} [selector] The CSS selector
     * @return {Dom} A Dom object of the matched child
     */
    child(selector){
        return new Dom(this.children(selector).get(0));
    }

    /**
     * Get all parents, optionally filtered by a given CSS selector
     *
     * @param {String} [selector] The CSS selector
     * @return {Dom} A Dom object of all matched parents
     */
    parents(selector){
        let parents = new Dom();

        this.forEach((element) => {
            parents.add(element.parentElement);
        });

        if(selector){
            parents = parents.filter(selector);
        }

        return parents;
    }

    /**
     * Interate over all the elements managed by the Dom object
     *
     * @param {Function} callback The function that will be executed on every element
     * @param {Element} callback.element The element that is currently being processed
     * @param {Integer} callback.index The index of the current element being processed
     */
    forEach(callback){
        this.elements.forEach(callback);
    }

    /**
     * Check if an element in the set of elements managed by the Dom object has a given CSS class
     *
     * @param {String} className The CSS class
     * @return {Boolean} Whether a match was found
     */
    hasClass(className) {
        return this.elements.some((element) => {
            return Dom.hasClass(element, className);
        });
    }

    /**
     * Add a CSS class to all the elements managed by the Dom object
     *
     * @param {String} className The CSS class
     * @return {this}
     */
    addClass(className) {
        this.forEach((element) => {
            Dom.addClass(element, className);
        });

        return this;
    }

    /**
     * Remove a CSS class from all the elements managed by the Dom object
     *
     * @param {String} className The CSS class
     * @return {this}
     */
    removeClass(className) {
        this.forEach((element) => {
            Dom.removeClass(element, className);
        });

        return this;
    }

    /**
     * Toggle a CSS class for all the elements managed by the Dom object
     *
     * @param {String} className The CSS class
     * @param {Boolean} [force] Whether to add or remove the class. The class is toggled if not specified
     * @return {this}
     */
    toggleClass(className, force) {
        this.forEach((element) => {
            Dom.toggleClass(element, className, force);
        });

        return this;
    }

    /**
     * Add an event listener on all the elements managed by the Dom object
     *
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @return {this}
     */
    addListener(type, callback, useCapture) {
		this.forEach((element) => {
            Dom.addListener(element, type, callback, useCapture);
        });

        return this;
    }

    /**
     * Add an event listener that only executes once on all the elements managed by the Dom object
     *
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @return {this}
     */
    addOneTimeListener(type, callback, useCapture) {
		this.forEach((element) => {
            Dom.addOneTimeListener(element, type, callback, useCapture);
        });

        return this;
    }

    /**
     * Add an event listener for descendents all the elements managed by the Dom object that match a given selector
     *
     * @param {String} selector The CSS selector to filter descendents by
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The original event
     * @param {Mixed} [scope] The value to use as this when executing the callback function
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @return {this}
     */
    addDelegate(selector, type, callback, scope, useCapture) {
        this.addListener(type, (evt) => {
            if(Dom.is(evt.target, selector)) {
                callback.call(scope || this, evt);
            }
        }, useCapture);

        return this;
    }

    /**
     * Remove an event listener from all the elements managed by the Dom object
     *
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} useCapture Whether the event should be executed in the capturing or in the bubbling phase
     * @return {this}
     */
    removeListener(type, callback, useCapture) {
        this.forEach((element) => {
            Dom.removeListener(element, type, callback, useCapture);
        });

        return this;
    }

    /**
     * Trigger an event from all the elements managed by the Dom object
     *
     * @param {String} type The event type
     * @param {Object} [data] Custom data to send with the event. The data is accessible through the event.detail property
     * @param {Boolean} [bubbles=true] Whether the event bubbles up through the DOM or not
     * @param {Boolean} [cancelable=true] Whether the event is cancelable
     * @return {Boolean} Whether no event was cancelled
     */
    triggerEvent(type, data, bubbles, cancelable){
        let return_value = true;

        this.forEach((element) => {
            return_value = Dom.triggerEvent(element, type, data, bubbles, cancelable) && return_value;
        });

        return return_value;
    }

    /**
     * Generic event handling function
     * Used when an instance of Dom is given as a callback for an event listener
     * See https://developer.mozilla.org/en-US/docs/Web/API/EventListener/handleEvent
     * The handlers forwards the event to a specific handler (if available) depending on the event type
     *
     * @param {Event} evt The event object
     */
    handleEvent(evt){
        const handler = `on${capitalize(evt.type)}`;

        if (isFunction(this[handler])) {
            this[handler](evt);
        }
    }

    /**
     * Set the innerHTML of all the elements managed by the Dom object, or get the innerHTML of the first element
     *
     * @param {String} [value] The value to set
     * @return {Mixed} The Dom object if used as a setter, the innerHTML of the first element if used as a getter
     */
    text(value) {
        if(typeof value !== "undefined"){
            this.forEach((element) => {
                Dom.text(element, value);
            });
            return this;
        }

        return Dom.text(this.get(0));
    }

    /**
     * Set the value of all the elements managed by the Dom object, or get the value of the first element
     *
     * @param {String} [value] The value to set
     * @return {Mixed} The Dom object if used as a setter, the value of the first element if used as a getter
     */
    val(value) {
        if(typeof value !== "undefined"){
            this.forEach((element) => {
                Dom.val(element, value);
            });
            return this;
        }

        return Dom.val(this.get(0));
    }

    /**
     * Set an attribute of all the elements managed by the Dom object, or get the value of an attribute of the first element
     *
     * @param {String} name The name of the attribute to set or get
     * @param {String} [value] The value to set
     * @return {Mixed} The Dom object if used as a setter, the value of the first element if used as a getter
     */
    attr(name, value) {
        if((typeof value !== "undefined") || isObject(name)){
            this.forEach((element) => {
                Dom.attr(element, name, value);
            });
            return this;
        }

        return Dom.attr(this.get(0), name);
    }

    /**
     * Set a property of all the elements managed by the Dom object, or get the value of a property of the first element
     *
     * @param {String} name The name of the property to set or get
     * @param {String} [value] The value to set
     * @return {Mixed} The Dom object if used as a setter, the value of the first element if used as a getter
     */
    prop(name, value) {
        if((typeof value !== "undefined") || isObject(name)){
            this.forEach((element) => {
                Dom.prop(element, name, value);
            });
            return this;
        }

        return Dom.prop(this.get(0), name);
    }

    /**
     * Set CSS style property of all the elements managed by the Dom object, or get the value of a CSS style property of the first element
     *
     * @param {String} name The CSS property's name
     * @param {String} value The CSS property's value
     * @param {Boolean} [inline=false] Whether to return the inline or computed style value
     * @return {Mixed} The Dom object if used as a setter, the CSS style value of the property of the first element if used as a getter
     */
    css(name, value, inline) {
        if(typeof value !== "undefined"){
            this.forEach((element) => {
                Dom.css(element, name, value, inline);
            });
            return this;
        }

        return Dom.css(this.get(0), name, value, inline);
    }

    /**
     * Set a custom data attribute on all the elements managed by the Dom object, or get the value of a custom data attribute of the first element
     *
     * @param {String} name The name of the data attribute
     * @param {String} value The value of the data attribute
     * @return {Mixed} The Dom object if used as a setter, the value of the data attribute of the first element if used as a getter
     */
    data(name, value) {
        if(typeof value !== "undefined"){
            this.forEach((element) => {
                Dom.data(element, name, value);
            });
            return this;
        }

        return Dom.data(this.get(0), name);
    }

    /**
     * Append children to the first element managed by the Dom object
     *
     * @param {Mixed} children An array of elemets or a single element to append
     * @return {this}
     */
    append(children){
        const _children = children instanceof Dom ? children.elements : children;

        Dom.append(this.get(0), _children);

        return this;
    }

    /**
     * Append each of the elements managed by the Dom object into a given element
     *
     * @param {Mixed} parent A Dom object or an Element to append the elements to
     * @return {this}
     */
    appendTo(parent){
        let _parent = parent instanceof Dom ? parent : new Dom(parent);
        _parent = _parent.get(0);

        this.forEach((element) => {
            Dom.append(_parent, element);
        });

        return this;
    }

    /**
     * Append each of the elements managed by the Dom object into a given element at a given position
     *
     * @param {Mixed} parent A Dom object or an Element to append the elements to
     * @param {Integer} index The index position to append at
     * @return {this}
     */
    insertAt(parent, index){
        const _parent = parent instanceof Dom ? parent : new Dom(parent);
        const element = _parent.children().get(index);

        if(element){
            Dom.before(element, this.elements);
        }
        else{
            this.appendTo(_parent);
        }

        return this;
    }

    /**
     * Remove all children of each element managed by the Dom object
     *
     * @return {this}
     */
    empty() {
        this.forEach((element) => {
            Dom.empty(element);
        });

        return this;
    }

    /**
     * Make all the elements managed by the Dom object visible
     *
     * @return {this}
     */
    show() {
        this.css('display', '');

        return this;
    }

    /**
     * Make all the elements managed by the Dom object invisible
     *
     * @return {this}
     */
    hide() {
        this.css('display', 'none');

        return this;
    }

    /**
     * Set focus on the first element managed by the Dom object
     *
     * @return {this}
     */
    focus() {
        this.get(0).focus();

        return this;
    }

    /**
     * Remove focus from the first element managed by the Dom object
     *
     * @return {this}
     */
    blur() {
        this.get(0).blur();

        return this;
    }

    /**
     * Get the top and left offset of the first element managed by the Dom object
     *
     * @return {Object} offset The top and left offset
     */
    offset() {
        return Dom.offset(this.get(0));
    }

    /**
     * Remove all the elements managed by the Dom object from the DOM
     *
     * @return {this}
     */
    remove() {
        if(this.triggerEvent('beforeremove') !== false){
            this.forEach((element) => {
                const parent = element.parentElement;
                Dom.remove(element);
                Dom.triggerEvent(parent, 'childremove', {'child': element});
            });
        }

        return this;
    }

    /**
     * Check if an element from the elements managed by the Dom object matches a CSS selector
     *
     * @param {String} selector The CSS selector
     * @return {Boolean} Whether an element matches the CSS selector
     */
    is(selector){
        return this.elements.some((element) => {
            return Dom.is(element, selector);
        });
    }

    /**
     * Get the first closest ancestor of the elements managed by the Dom object which matches a given CSS selector
     *
     * @param {String} selector The CSS selector
     * @return {Element} The matched element
     */
    closest(selector){
        let el = null;

        this.elements.some((element) => {
            el = Dom.closest(element, selector);
            return el !== null;
        });

        return el;
    }

}
