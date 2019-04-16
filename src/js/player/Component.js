import Dom from '../core/Dom';
import {isNumber, isFunction} from '../core/utils/Var';
import {uuid} from '../core/utils/String';
import CuePoint from './CuePoint';

/**
 * A generic component class
 *
 * @emits {propchange} Fired when a property changed
 * @param {Component} component The component instance
 * @param {String} property The name of the property
 * @param {Mixed} value The new value of the property
 */
export default class Component extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [container=null] The Dom instance to which the component should be appended
     * @property {Integer} [index=null] The index position at which the component should be appended
     * @property {Object} [properties={}] A list of the component properties as name/descriptor pairs
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': 'metaScore-component'});

        // Get default configs.
        const defaults = this.constructor.getDefaults();

        // Add default property values.
        Object.entries(defaults.properties).forEach(([name, property]) => {
            if('default' in property){
                defaults[name] = property.default;
            }
        });

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, defaults, configs);

        // keep a reference to this class instance in the DOM node
        this.get(0)._metaScore = this;

        if(this.configs.container){
            if(isNumber(this.configs.index)){
                this.insertAt(this.configs.container, this.configs.index);
            }
            else{
                this.appendTo(this.configs.container);
            }
        }

        if(this.configs.listeners){
            Object.entries(this.configs.listeners).forEach(([key, value]) => {
                this.addListener(key, value);
            });
        }

        this.setupUI();

        this.setPropertyValues(this.configs);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'id': `component-${uuid(10)}`,
            'container': null,
            'index': null,
            'properties': {
                'id': {
                    'editable': false,
                    'getter': function(){
                        return this.attr('id');
                    },
                    'setter': function(value){
                        this.attr('id', value);
                    }
                },
            }
        };
    }

    /**
    * Get the component's type
    *
    * @return {String} The component's type
    */
    static getType(){
        return 'Component';
    }

    /**
    * Check if the component is an instance of a component type
    *
    * @param {String} type The type to check for
    * @return {Boolean} Whether the component is of the specified type or a sub-type
    */
    static instanceOf(type){
        if(type === this.getType()){
            return true;
        }

        const parent = Object.getPrototypeOf(this);
        if('instanceOf' in parent){
            return parent.instanceOf(type);
        }

        return false;
    }

    /**
     * Setup the component's UI
     *
     * @private
     */
    setupUI() {
        return this;
    }

    /**
     * Get the component's id
     *
     * @return {String} The id
     */
    getId() {
        return this.getPropertyValue('id');
    }

    /**
     * Get the value of the component's name property
     *
     * @return {String} The name
     */
    getName() {
        return this.getPropertyValue('name');
    }

    /**
     * Check if the component is of a given type
     *
     * @param {String} type The type to check for
     * @return {Boolean} Whether the component is of the given type
     */
    instanceOf(type){
        return this.constructor.instanceOf(type);
    }

    /**
     * Check if the component has a given property
     *
     * @param {String} name The property's name
     * @return {Boolean} Whether the component has the given property
     */
    hasProperty(name){
        return name in this.getProperties();
    }

    /**
     * Get a given property
     *
     * @param {String} name The name of the property
     * @return {Mixed} The property
     */
    getProperty(name){
        return this.getProperties()[name];
    }

    /**
     * Get all properties
     *
     * @return {Object[]} The properties
     */
    getProperties(){
        return this.configs.properties;
    }

    /**
     * Get the value of a given property
     *
     * @param {String} name The name of the property
     * @return {Mixed} The value of the property
     */
    getPropertyValue(name){
        if(this.hasProperty(name)){
            const prop = this.getProperty(name);

            if('getter' in prop){
                const selected = this.hasClass('selected');

                if(selected){
                    this.removeClass('selected');
                }

                const value = prop.getter.call(this);

                if(selected){
                    this.addClass('selected');
                }

                return value;
            }
        }

        return null;
    }

    /**
     * Get the values of all properties
     *
     * @param {Boolean} [skipDefaults=true] Whether to skip properties that have the default value
     * @param {Boolean} [skipID=false] Whether to skip the 'id' property, usefull when cloning
     * @return {Object} The values of the properties as name/value pairs
     */
    getPropertyValues(skipDefaults, skipID){
        const values = {};
        const _skipDefaults = (typeof skipDefaults === "undefined") ? true : skipDefaults;
        const selected = this.hasClass('selected');

        if(selected){
            this.removeClass('selected');
        }

		Object.entries(this.getProperties()).forEach(([name, prop]) => {
            // Skip if this is an id property and the skipID argument is true.
            if(skipID === true && name === 'id'){
                return;
            }

            // Skip if this property does not apply.
            if('applies' in prop && isFunction(prop.applies) && !prop.applies.call(this)){
                return;
            }

            // Return the value retreived from the property's getter.
            if('getter' in prop){
                const value = prop.getter.call(this, _skipDefaults, skipID);

                if(value !== null){
                    values[name] = value;
                }
            }
        });

        if(selected){
            this.addClass('selected');
        }

        return values;
    }

    /**
     * Set the value of a given property
     *
     * @param {String} name The name of the property
     * @param {Mixed} value The value to set
     * @param {Boolean} [supressEvent=false] Whether to supress the propchange event
     * @return {this}
     */
    setPropertyValue(name, value, supressEvent){
        if(name in this.configs.properties && 'setter' in this.configs.properties[name]){
            this.configs.properties[name].setter.call(this, value);

            if(supressEvent !== true){
                this.triggerEvent('propchange', {'component': this, 'property': name, 'value': value});
            }
        }

        return this;
    }

    /**
     * Set property values
     *
     * @param {Object} properties The list of properties to set as name/value pairs
     * @param {Boolean} [supressEvent=false] Whether to supress the propchange event
     * @return {this}
     */
    setPropertyValues(properties, supressEvent){
        Object.entries(properties).forEach(([key, value]) => {
            this.setPropertyValue(key, value, supressEvent);
        });

        return this;
    }

    /**
     * Show or hide the component
     *
     * @param {Boolean} [show=undefined] Whether to show or hide the component. If undefined, the visibility will be toggled
     * @return {this}
     */
    toggleVisibility(show){
        this.setPropertyValue('hidden', !(typeof show === 'undefined' ? this.getPropertyValue('hidden') : show));

        return this;
    }

    /**
     * Set a cuepoint on the component
     *
     * @param {Object} configs Custom configs to override defaults
     * @return {player.CuePoint} The created cuepoint
     */
    setCuePoint(configs){
        const inTime = this.getPropertyValue('start-time');
        const outTime = this.getPropertyValue('end-time');

        if(this.cuepoint){
            this.cuepoint.destroy();
        }

        if(inTime !== null || outTime !== null){
            /**
             * A cuepoint associated with the component
             * @type {CuePoint}
             */
            this.cuepoint = new CuePoint(Object.assign({}, configs, {
                'inTime': inTime,
                'outTime': outTime
            }));

            if(this.onCuePointStart){
                this.cuepoint.addListener('start', this.onCuePointStart.bind(this));
            }

            if(this.onCuePointUpdate){
                this.cuepoint.addListener('update', this.onCuePointUpdate.bind(this));
            }

            if(this.onCuePointStop){
                this.cuepoint.addListener('stop', this.onCuePointStop.bind(this));
            }

            this.cuepoint.init();
        }

        return this.cuepoint;
    }

    /**
     * Get the cuepoint of the component
     *
     * @return {player.CuePoint} The cuepoint
     */
    getCuePoint() {
        return this.cuepoint;
    }

}
