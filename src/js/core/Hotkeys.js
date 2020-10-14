import {isArray} from './utils/Var';
import Dom from './Dom';

/**
 * A keyboard shortcuts manager.
 */
export default class Hotkeys {

    /**
     * Instantiate
     */
    constructor() {

        // fix event handlers scope
        this.handleEvent = this.handleEvent.bind(this);

        /**
         * A list of listeners by context.
         * @type {Object}
         */
        this.listeners = {
            'global': []
        };

        /**
         * A list of attached element configs.
         */
        this.elements = [];
    }

    /**
     * Attach this hotkeys instance to an element.
     *
     * @param {Dom} element The element to attach to.
     * @param {String|null} [selector] A selector to filter event targets against.
     * @returns {this}
     */
    attachTo(element, selector = null) {
        let handler = this.handleEvent;

        if (selector) {
            handler = (evt) => {
                if(Dom.is(evt.target, selector)) {
                    this.handleEvent(evt);
                }
            };
        }

        element
           .addListener('keydown', handler)
           .addListener('keyup', handler);

        this.elements.push({
            'element': element,
            'selector': selector,
            'handler': handler,
        });

        return this;

    }

    /**
     * Detach this hotkeys instance from an element.
     *
     * @param {Dom} element The element to attach to.
     * @param {String|null} [selector] A selector to filter event targets against.
     * @returns {this}
     */
    detachFrom(element, selector = null) {
        this.elements = this.elements.filter((value) => {
            if (value.element === element && (!selector || value.selector === selector)) {
                element
                    .removeListener('keydown', value.handler)
                    .removeListener('keyup', value.handler);
                return false;
            }
            return true;
        });


        return this;
    }

    /**
     * Bind one or more key combinations.
     *
     * @param {String|Array} keyCombo The key combination(s).
     * @param {Function} handler The callback function.
     * @param {Object} options Options
     * @property {String} [options.keydown=true] Whether to call the handler on keydown events.
     * @property {String} [options.keyup=false] Whether to call the handler on keyup events.
     * @property {String} [options.context='global'] A context to assign the key combination(s) to.
     * @property {String} [options.preventRepeat=false] Whether to call the handler on repeat events.
     * @returns {this}
     */
    bind(keyCombo, handler = null, {keydown = true, keyup = false, context = 'global', preventRepeat = false} = {}) {
        if (isArray(keyCombo)){
            keyCombo.forEach((combo) => {
                this.bind(combo, handler, {
                    'keydown': keydown,
                    'keyup': keyup,
                    'context': context,
                    'preventRepeat': preventRepeat
                });
            });
        }
        else{
            if (!(context in this.listeners)) {
                this.listeners[context] = [];
            }

            this.listeners[context].push({
                'keyCombo': this.normalizeKeyCombo(keyCombo),
                'handler': handler,
                'keydown': keydown,
                'keyup': keyup,
                'preventRepeat': preventRepeat,
                'executing': false
            });
        }

        return this;
    }

    /**
     * Unbind one or more key combinations.
     *
     * @param {String|Array} keyCombo The key combination(s).
     * @param {Function} handler The callback function.
     * @param {Object} options Options
     * @property {String} [options.context='global'] The context the key combination(s) is assigned to.
     * @returns {this}
     */
    unbind(keyCombo, handler = null, {context = 'global'}) {
        if (isArray(keyCombo)){
            keyCombo.forEach((combo) => {
                this.unbind(combo, handler, {'context': context});
            });
        }
        else if (context in this.listeners) {
            this.listeners[context] = this.listeners[context].filter((listener) => {
                return !(
                    listener.keyCombo === this.normalizeKeyCombo(keyCombo) &&
                    (!handler || listener.handler === handler)
                );
            });
        }

        return this;
    }

    /**
     * Set the active context.
     *
     * @param {String} context The context to activate.
     * @returns {this}
     */
    setActiveContext(context) {
        this.context = context;

        return this;
    }

    /**
     * Get the active context.
     *
     * @returns {String} The active context.
     */
    getActiveContext() {
        return this.context || 'global';
    }

    /**
     * Handle a keyboard event.
     *
     * @param {KeyboardEvent} evt The event to handle.
     */
    handleEvent(evt) {
        const keyCombo = this.getEventKeyCombo(evt);
        const context = this.getActiveContext();

        let listener = null;
        if (context !== 'global' && context in this.listeners) {
            listener = this.listeners[context].find((value) => {
                return value.keyCombo === keyCombo && value[evt.type];
            });
        }
        if (!listener) {
            listener = this.listeners.global.find((value) => {
                return value.keyCombo === keyCombo && value[evt.type];
            });
        }

        if (listener && (!listener.preventRepeat || !evt.repeat)) {
            listener.handler(evt);
            evt.preventDefault();
        }
    }

    /**
     * Get a key combination string from a keyboard event.
     *
     * @param {KeyboardEvent} evt The event.
     * @returns {String} The key combination.
     */
    getEventKeyCombo(evt) {
        const key = evt.key;
        const modifiers = [];

        if (evt.altKey && key !== 'Alt') {
            modifiers.push('alt');
        }
        if (evt.ctrlKey && key !== 'Control') {
            modifiers.push('control');
        }
        if (evt.shiftKey && key !== 'Shift') {
            modifiers.push('shift');
        }

        const combo = modifiers.length > 0 ? `${key}+${modifiers.sort().join('+')}` : key;

        return combo.toLowerCase();
    }

    /**
     * Normalize a key combination string.
     *
     * @param {String} combo The key combination string.
     * @returns {String} The normalized key combination string.
     */
    normalizeKeyCombo(combo) {
        const keys = combo.toLowerCase().split('+');

        if (keys.length < 1) {
            return null;
        }

        const key = keys.pop();
        const normalized = keys.length > 0 ? `${key}+${keys.sort().join('+')}` : key;

        return normalized;
    }

    /**
     * Detach from all elements.
     */
    destroy() {
        while(this.elements.length > 0) {
            this.detachFrom(this.elements[0].element);
        }
    }

}
