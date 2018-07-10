import {isArray, isString, isObject} from './utils/Var';

/**
 * Fired before an element is removed
 *
 * @event beforeremove
 */
const EVT_BEFOREREMOVE = 'beforeremove';

/**
 * Fired when a child element is removed
 *
 * @event childremove
 * @param {Object} child The removed child
 */
const EVT_CHILDREMOVE = 'childremove';

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
 * @static
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

export default class Dom {

    //TODO: improve by using a NodeList for the list of elements

    /**
     * A class for Dom manipulation
     *
     * @class Dom
     * @extends Class
     * @constructor
     * @param {Mixed} [...args] An HTML string and an optional list of attributes to apply, or a CSS selector with an optional parent and an optional list of attributes to apply
     *
     * @example
     *     var div = new Dom('<div/>', {'class': 'my-class'});
     *     var body = new Dom('body');
     */
    constructor(...args) {
        let elements;

        this.elements = [];

        if(arguments.length > 0){
            elements = Dom.elementsFromString(...args);
            if(elements){
                this.add(elements);

                if(arguments.length > 1){
                    this.attr(arguments[1]);
                }
            }
            else{
                elements = Dom.selectElements(...args);
                if(elements){
                    this.add(elements);

                    if(arguments.length > 2){
                        this.attr(arguments[2]);
                    }
                }
            }
        }
    }

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
    static camelReplaceFn(match, letter) {
        return letter.toUpperCase();
    }

    /**
     * Normalize a string to Camel Case
     *
     * @method camel
     * @static
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
     * @method selectElement
     * @static
     * @param {String} The CSS selector
     * @param {HTMLElement} [parent=document] The HTML Element in which to search
     * @return {HTMLElement} The found element if any
     */
    static selectElement(selector, parent) {
        let element;

        if(!parent){
            parent = document;
        }

        if (isString(selector)) {
            element = parent.querySelector(selector);
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
     * @method selectElements
     * @static
     * @param {String} The CSS selector
     * @param {HTMLElement} [parent=document] The HTML Element in which to search
     * @return {Mixed} An HTML NodeList or an array of found elements if any
     */
    static selectElements(selector, parent) {
        let elements;

        if(selector !== undefined){
            if(!parent){
                parent = document;
            }
            else if(parent instanceof Dom){
                parent = parent.get(0);
            }

            if(isString(selector)) {
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
    }

    /**
     * Creates elements from an HTML string (see http://krasimirtsonev.com/blog/article/Revealing-the-magic-how-to-properly-convert-HTML-string-to-a-DOM-element)
     *
     * @method elementsFromString
     * @static
     * @param {String} html The HTML string
     * @return {HTML NodeList} A NodeList of the created elements, or null on error
     */
    static elementsFromString(html){
        let wrapMap = {
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

        if(match !== null){
            tag = match[0].replace(/</g, '').replace(/\/?>/g, '');

            map = wrapMap[tag] || wrapMap._default;
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
    }

    /**
     * Get the document containing an element
     *
     * @method getElementDocument
     * @static
     * @param {HTMLElement} element The element
     * @return {HTML Document } The document
     */
    static getElementDocument(element){
        return element.ownerDocument;
    }

    /**
     * Get the window containing an element
     *
     * @method getElementWindow
     * @static
     * @param {HTMLElement} element The element
     * @return {HTML Window} The window
     */
    static getElementWindow(element){
        const doc = this.getElementDocument(element);

        return doc.defaultView || doc.parentWindow;
    }

    /**
     * Check if an element has a given CSS lass
     *
     * @method hasClass
     * @static
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
     * @method addClass
     * @static
     * @param {HTMLElement} element The element
     * @param {String} className The CSS class
     */
    static addClass(element, className){
        let classNames = className.split(" "),
            i = 0, l = classNames.length;

        for(; i<l; i++){
            element.classList.add(classNames[i]);
        }
    }

    /**
     * Remove a CSS class from an element
     *
     * @method removeClass
     * @static
     * @param {HTMLElement} element The element
     * @param {String} className The CSS class
     */
    static removeClass(element, className){
        let classNames = className.split(" "),
            i = 0, l = classNames.length;

        for(; i<l; i++){
            element.classList.remove(classNames[i]);
        }
    }

    /**
     * Toggle a CSS class on an element
     *
     * @method toggleClass
     * @static
     * @param {HTMLElement} element The element
     * @param {String} className The CSS class
     * @param {Boolean} [force] Whether to add or remove the class. The class is toggled if not specified
     */
    static toggleClass(element, className, force){
        let classNames = className.split(" "),
            i = 0, l = classNames.length;

        if(force === undefined){
            for(; i<l; i++){
                element.classList.toggle(classNames[i]);
            }
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
     * @method addListener
     * @static
     * @param {HTMLElement} element The element
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @return {HTMLElement} The element
     */
    static addListener(element, type, callback, useCapture){
        if(useCapture === undefined){
            useCapture = ('type' in bubbleEvents) ? bubbleEvents[type] : false;
        }

        element.addEventListener(type, callback, useCapture);

        return element;
    }

    /**
     * Add an event listener that only executes once on an element
     *
     * @method addListenerOnce
     * @static
     * @param {HTMLElement} element The element
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @return {HTMLElement} The element
     */
    static addOneTimeListener(element, type, callback, useCapture){
        if(useCapture === undefined){
            useCapture = ('type' in bubbleEvents) ? bubbleEvents[type] : false;
        }

        const handler = function(evt){
            element.removeEventListener(type, handler, useCapture);
            return callback(evt);
        };

        element.addEventListener(type, handler, useCapture);

        return element;
    }

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
    static removeListener(element, type, callback, useCapture){
        if(useCapture === undefined){
            useCapture = ('type' in bubbleEvents) ? bubbleEvents[type] : false;
        }

        element.removeEventListener(type, callback, useCapture);

        return element;
    }

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
     * @method text
     * @static
     * @param {HTMLElement} element The element
     * @param {String} [html] The value to set
     * @return {String} The innerHTML of the element
     */
    static text(element, html){
        if(html !== undefined){
            element.innerHTML = html;
        }

        return element.innerHTML;
    }

    /**
     * Set or get the value of an element
     *
     * @method val
     * @static
     * @param {HTMLElement} element The element
     * @param {String} [value] The value to set
     * @return {String} The value of the element
     */
    static val(element, value){
        let options, values;

        // if this is a multiselect element
        if(this.is(element, 'select[multiple]')){
            if(value){
                if(!isArray(value)){
                    value = [value];
                }

                options = this.selectElements('option', element);

                options.forEach((option) => {
                    this.prop(option, 'selected', value.includes(this.val(option)));
                });
            }

            options = this.selectElements('option:checked', element);
            values = [];

            options.forEach((option) => {
                values.push(this.val(option));
            });

            return values;
        }

        // otherwise
        if(value !== undefined){
            element.value = value;
        }
        return element.value;
    }

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
                        if(value !== undefined){
                            element.setAttribute(name, value);
                        }

                        return element.getAttribute(name);
                    }
                    break;
            }
        }

    }

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
    static prop(element, name, value){
        if(isObject(name)){
			Object.entries(name).forEach(([key, val]) => {
                this.prop(element, key, val);
            });
        }
        else{
            if(value === null){
                try {
                    element[name] = undefined;
                    delete element[name];
                }
                catch(e){
                    // TODO
                }
            }
            else{
                if(value !== undefined){
                    element[name] = value;
                }

                return element[name];
            }
        }
    }

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
    static css(element, name, value, inline){
        let camel, style;

        camel = this.camel(name);

        if(value !== undefined){
            element.style[camel] = value;
        }

        style = inline === true ? element.style : window.getComputedStyle(element);

        value = style.getPropertyValue(name);

        return value !== "" ? value : null;
    }

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
    static data(element, name, value){
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
    }

    /**
     * Append children to an element
     *
     * @method append
     * @static
     * @param {HTMLElement} element The element
     * @param {Mixed} children An array of elemets or a single element to append
     */
    static append(element, children){
        if (!isArray(children)) {
            children = [children];
        }

        children.forEach((child) => {
            element.appendChild(child);
        });
    }

    /**
     * Insert siblings before an element
     *
     * @method before
     * @static
     * @param {HTMLElement} element The element
     * @param {Mixed} siblings An array of elemets or a single element to insert
     */
    static before(element, siblings){
        if (!isArray(siblings)) {
            siblings = [siblings];
        }

        siblings.forEach((sibling) => {
            element.parentElement.insertBefore(sibling, element);
        });
    }

    /**
     * Insert siblings after an element
     * @method after
     * @static
     * @param {HTMLElement} element The element
     * @param {Mixed} siblings An array of elemets or a single element to insert
     */
    static after(element, siblings){
        if (!isArray(siblings)) {
            siblings = [siblings];
        }

        siblings.forEach((sibling) => {
            element.parentElement.insertBefore(sibling, element.nextSibling);
        });
    }

    /**
     * Remove all element children
     *
     * @method empty
     * @static
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
     * @method remove
     * @static
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
     * @method is
     * @static
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
     * @method closest
     * @static
     * @param {HTMLElement} element The element
     * @param {String} selector The CSS selector
     * @return {Element} The matched element
     */
    static closest(element, selector){
        let win;

        if(element instanceof Element){
            return Element.prototype.closest.call(element, selector);
        }

        win = this.getElementWindow(element);
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
     * @method offset
     * @static
     * @param {HTMLElement} element The element
     * @return {Object} The top and left offset
     */
    static offset(element){
        let left = 0,
            top = 0;

        if(element.offsetParent){
            do{
                left += element.offsetLeft;
                top += element.offsetTop;
            }while ((element = element.offsetParent));
        }

        return {'left': left, 'top': top};
    }

    /**
     * Add an element to the set of elements managed by the Dom object
     *
     * @method add
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
     * @method count
     * @return {Integer} The number of elements
     */
    count() {
        return this.elements.length;
    }

    /**
     * Get an element by index from the set of elements managed by the Dom object
     *
     * @method get
     * @param {Integer} index The index of the elements to retreive
     * @return {Element} The element
     */
    get(index){
        return this.elements[index];
    }

    /**
     * Return a new Dom object with the elements filtered by a CSS selector
     *
     * @method filter
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
     * @method index
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
     * @method find
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
     * @method children
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
     * @method child
     * @param {String} [selector] The CSS selector
     * @return {Dom} A Dom object of the matched child
     */
    child(selector){
        return new Dom(this.children(selector).get(0));
    }

    /**
     * Get all parents, optionally filtered by a given CSS selector
     *
     * @method parents
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
     * @method forEach
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
     * @method hasClass
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
     * @method addClass
     * @param {String} className The CSS class
     * @chainable
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
     * @method removeClass
     * @param {String} className The CSS class
     * @chainable
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
     * @method toggleClass
     * @param {String} className The CSS class
     * @param {Boolean} [force] Whether to add or remove the class. The class is toggled if not specified
     * @chainable
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
     * @method addListener
     * @static
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @chainable
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
     * @method addOneTimeListener
     * @static
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @chainable
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
     * @method addDelegate
     * @param {String} selector The CSS selector to filter descendents by
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The original event
     * @param {Mixed} [scope] The value to use as this when executing the callback function
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @chainable
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
     * @method removeListener
     * @static
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} useCapture Whether the event should be executed in the capturing or in the bubbling phase
     * @chainable
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
     * @method triggerEvent
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
     * Set the innerHTML of all the elements managed by the Dom object, or get the innerHTML of the first element
     *
     * @method text
     * @param {String} [html] The value to set
     * @return {Mixed} The Dom object if used as a setter, the innerHTML of the first element if used as a getter
     */
    text(value) {
        if(value !== undefined){
            this.forEach((element) => {
                Dom.text(element, value);
            });
        }
        else{
            return Dom.text(this.get(0));
        }
    }

    /**
     * Set the value of all the elements managed by the Dom object, or get the value of the first element
     *
     * @method val
     * @param {String} [value] The value to set
     * @return {Mixed} The Dom object if used as a setter, the value of the first element if used as a getter
     */
    val(value) {
        if(value !== undefined){
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
     * @method attr
     * @param {HTMLElement} element The element
     * @param {String} [value] The value to set
     * @return {Mixed} The Dom object if used as a setter, the value of the first element if used as a getter
     */
    attr(name, value) {
        if(value !== undefined || isObject(name)){
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
     * @method prop
     * @param {HTMLElement} element The element
     * @param {String} [value] The value to set
     * @return {Mixed} The Dom object if used as a setter, the value of the first element if used as a getter
     */
    prop(name, value) {
        if(value !== undefined || isObject(name)){
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
     * @method css
     * @param {String} name The CSS property's name
     * @param {String} value The CSS property's value
     * @param {Boolean} [inline=false] Whether to return the inline or computed style value
     * @return {Mixed} The Dom object if used as a setter, the CSS style value of the property of the first element if used as a getter
     */
    css(name, value, inline) {
        if(value !== undefined){
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
     * @method data
     * @param {String} name The name of the data attribute
     * @param {String} value The value of the data attribute
     * @return {Mixed} The Dom object if used as a setter, the value of the data attribute of the first element if used as a getter
     */
    data(name, value) {
        if(value !== undefined){
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
     * @method append
     * @param {Mixed} children An array of elemets or a single element to append
     * @chainable
     */
    append(children){
        if(children instanceof Dom){
            children = children.elements;
        }

        Dom.append(this.get(0), children);

        return this;
    }

    /**
     * Append each of the elements managed by the Dom object into a given element
     *
     * @method appendTo
     * @param {Mixed} parent A Dom object or an Element to append the elements to
     * @chainable
     */
    appendTo(parent){
        if(!(parent instanceof Dom)){
            parent = new Dom(parent);
        }

        parent = parent.get(0);

        this.forEach((element) => {
            Dom.append(parent, element);
        });

        return this;
    }

    /**
     * Append each of the elements managed by the Dom object into a given element at a given position
     *
     * @method insertAt
     * @param {Mixed} parent A Dom object or an Element to append the elements to
     * @param {Integer} index The index position to append at
     * @chainable
     */
    insertAt(parent, index){
        let element;

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
    }

    /**
     * Remove all children of each element managed by the Dom object
     *
     * @method empty
     * @chainable
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
     * @method show
     * @chainable
     */
    show() {
        this.css('display', '');

        return this;
    }

    /**
     * Make all the elements managed by the Dom object invisible
     *
     * @method hide
     * @chainable
     */
    hide() {
        this.css('display', 'none');

        return this;
    }

    /**
     * Set focus on the first element managed by the Dom object
     *
     * @method focus
     * @chainable
     */
    focus() {
        this.get(0).focus();

        return this;
    }

    /**
     * Remove focus from the first element managed by the Dom object
     *
     * @method blur
     * @chainable
     */
    blur() {
        this.get(0).blur();

        return this;
    }

    /**
     * Get the top and left offset of the first element managed by the Dom object
     *
     * @method offset
     * @return {Object} offset The top and left offset
     */
    offset() {
        return Dom.offset(this.get(0));
    }

    /**
     * Remove all the elements managed by the Dom object from the DOM
     *
     * @method remove
     * @chainable
     */
    remove() {
        if(this.triggerEvent(EVT_BEFOREREMOVE) !== false){
            this.forEach((element) => {
                const parent = element.parentElement;
                Dom.remove(element);
                Dom.triggerEvent(parent, EVT_CHILDREMOVE, {'child': element});
            });
        }

        return this;
    }

    /**
     * Check if an element from the elements managed by the Dom object matches a CSS selector
     *
     * @method is
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
     * @method closest
     * @param {String} selector The CSS selector
     * @return {Element} The matched element
     */
    closest(selector){
        return this.elements.find((element) => {
            return Dom.closest(element, selector) !== null;
        });
    }

}
