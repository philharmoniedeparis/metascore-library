import {isArray} from './utils/Var';
import Dom from './Dom';

/**
 * A key combination.
 *
 * @private
 */
class KeyCombo {
    /**
     * Instantiate
     *
     * @param {string} combo The key combination.
     */
    constructor(combo) {
        this.key = null;
        this.modifiers = [];

        const keys = combo.split('+');
        if (keys.length > 0) {
            const key = keys.pop();
            const modifiers = keys;

            this.key = key;
            this.modifiers = modifiers.sort();
        }
    }

    getKey() {
        return this.key;
    }

    getModifiers() {
        return this.modifiers;
    }

    matchesEvent(evt) {
        if (this.key !== evt.key) {
            return false;
        }

        if (this.modifiers.length === 0) {
            return true;
        }

        const modifiers = [];
        if (evt.altKey && evt.key !== 'Alt') {
            modifiers.push('Alt');
        }
        if (evt.ctrlKey && evt.key !== 'Control') {
            modifiers.push('Control');
        }
        if (evt.shiftKey && evt.key !== 'Shift') {
            modifiers.push('Shift');
        }

        return this.modifiers.join('+') === modifiers.sort().join('+');
    }

    isEqual(combo){
        if (this.key !== combo.key) {
            return false;
        }

        if (this.modifiers.length === combo.modifiers.length) {
            return true;
        }

        return this.modifiers.join('+') === combo.modifiers.join('+');
    }
}

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
         * Whether the hotkeys are enabled or not.
         * @type {Boolean}
         */
        this.enabled = true;

        /**
         * A list of listeners.
         * @type {Array}
         */
        this.listeners = [];

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
     * @param {Object} [options] Options
     * @property {String} [options.keydown=true] Whether to call the handler on keydown events.
     * @property {String} [options.keyup=false] Whether to call the handler on keyup events.
     * @property {String} [options.preventRepeat=false] Whether to call the handler on repeat events.
     * @returns {this}
     */
    bind(keyCombo, handler, {keydown=true, keyup=false, preventRepeat=false, description=''} = {}) {
        this.listeners.push({
            'keyCombo': !isArray(keyCombo) ? new KeyCombo(keyCombo) : keyCombo.map((k) => new KeyCombo(k)),
            'handler': handler,
            'keydown': keydown,
            'keyup': keyup,
            'preventRepeat': preventRepeat,
            'description': description
        });

        this.listeners = this.listeners.sort((a, b) => {
            if (isArray(a.keyCombo) || isArray(b.keyCombo)) {
                // @TODO: sort.
                return 0;
            }

            if (a.keyCombo.getKey() !== b.keyCombo.getKey()) {
                return 0;
            }
            const a_modifiers = a.keyCombo.getModifiers();
            const b_modifiers = b.keyCombo.getModifiers();
            if (a_modifiers.length > b_modifiers.length) {
                return -1;
            }
            else if (a_modifiers.length < b_modifiers.length) {
                return 1;
            }
            return 0;
        });

        return this;
    }

    /**
     * Unbind one or more key combinations.
     *
     * @param {String|Array} keyCombo The key combination(s).
     * @param {Function} [handler] The callback function.
     * @returns {this}
     */
    unbind(keyCombo, handler=null) {
        const combo = !isArray(keyCombo) ? new KeyCombo(keyCombo) : keyCombo.map((k) => new KeyCombo(k));
        const listeners = [];

        this.listeners.forEach((listener) => {
            if (handler && listener.handler !== handler) {
                listeners.push(listener);
                return;
            }

            if(isArray(listener.keyCombo)) {
                listener.keyCombo = listener.keyCombo.filter((c) => {
                    if (isArray(combo)) {
                        return combo.some((v) => {
                            return c.isEqual(v);
                        });
                    }

                    return c.isEqual(combo);
                });

                if (listener.keyCombo.length) {
                    listeners.push(listener);
                }
            }
        });

        this.listeners = listeners;

        return this;
    }

    /**
     * Handle a keyboard event.
     *
     * @param {KeyboardEvent} evt The event to handle.
     */
    handleEvent(evt) {
        if (!this.enabled) {
            return;
        }

        let found = null;
        found = this.listeners.find((listener) => {
            if (!listener[evt.type]) {
                return false;
            }

            if (isArray(listener.keyCombo)) {
                return listener.keyCombo.some((c) => {
                    return c.matchesEvent(evt);
                })
            }

            return listener.keyCombo.matchesEvent(evt);
        });

        if (found) {
            // Only call the handler if this is not a repeat, or preventRepeat is false.
            if (!found.preventRepeat || !evt.repeat) {
                found.handler(evt);
            }
            // Prevent default browser action even on repeat.
            evt.preventDefault();
        }
    }

    /**
     * Enable the hotkeys.
     *
     * @returns {this}
     */
    enable() {
        this.enabled = true;

        return this;
    }

    /**
     * Disable the hotkeys.
     *
     * @returns {this}
     */
    disable() {
        this.enabled = false;

        return this;
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
