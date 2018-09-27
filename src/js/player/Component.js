import Dom from '../core/Dom';
import {isNumber} from '../core/utils/Var';
import {uuid} from '../core/utils/String';
import CuePoint from './CuePoint';

/**
 * Fired when a property changed
 *
 * @event propchange
 * @param {Component} component The component instance
 * @param {String} property The name of the property
 * @param {Mixed} value The new value of the property
 */
const EVT_PROPCHANGE = 'propchange';

export default class Component extends Dom {

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
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': 'metaScore-component', 'id': `component-${uuid(5)}`});

        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

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

    static getDefaults(){
        return {
            'container': null,
            'index': null,
            'properties': {}
        };
    }

    static getType(){
        return 'Component';
    }

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
     * @method setupUI
     * @private
     */
    setupUI() {
        return this;
    }

    /**
     * Get the component's id
     *
     * @method getId
     * @return {String} The id
     */
    getId() {
        return this.attr('id');
    }

    /**
     * Get the value of the component's name property
     *
     * @method getName
     * @return {String} The name
     */
    getName() {
        return this.getPropertyValue('name');
    }

    /**
     * Check if the component is of a given type
     *
     * @method instanceOf
     * @param {String} type The type to check for
     * @return {Boolean} Whether the component is of the given type
     */
    instanceOf(type){
        return this.constructor.instanceOf(type);
    }

    /**
     * Check if the component has a given property
     *
     * @method hasProperty
     * @param {String} name The property's name
     * @return {Boolean} Whether the component has the given property
     */
    hasProperty(name){
        return name in this.getProperties();
    }

    /**
     * Get a given property
     *
     * @method getProperty
     * @param {String} name The name of the property
     * @return {Mixed} The property
     */
    getProperty(name){
        return this.getProperties()[name];
    }

    /**
     * Get all properties
     *
     * @method getProperties
     * @return {Object[]} The properties
     */
    getProperties(){
        return this.configs.properties;
    }

    /**
     * Get the value of a given property
     *
     * @method getProperty
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
     * @method getPropertyValues
     * @param {Boolean} [skipDefaults=true] Whether to skip properties that have the default value
     * @return {Object} The values of the properties as name/value pairs
     */
    getPropertyValues(skipDefaults){
        const values = {};
        const _skipDefaults = (typeof skipDefaults === "undefined") ? true : skipDefaults;
        const selected = this.hasClass('selected');

        if(selected){
            this.removeClass('selected');
        }

		Object.entries(this.getProperties()).forEach(([name, prop]) => {
            if('getter' in prop){
                const value = prop.getter.call(this, _skipDefaults);

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
     * @method setProperty
     * @param {String} name The name of the property
     * @param {Mixed} value The value to set
     * @param {Boolean} [supressEvent=false] Whether to supress the propchange event
     * @chainable
     */
    setPropertyValue(name, value, supressEvent){
        if(name in this.configs.properties && 'setter' in this.configs.properties[name]){
            this.configs.properties[name].setter.call(this, value);

            if(supressEvent !== true){
                this.triggerEvent(EVT_PROPCHANGE, {'component': this, 'property': name, 'value': value});
            }
        }

        return this;
    }

    /**
     * Set property values
     *
     * @method setPropertyValues
     * @param {Object} properties The list of properties to set as name/value pairs
     * @param {Boolean} [supressEvent=false] Whether to supress the propchange event
     * @chainable
     */
    setPropertyValues(properties, supressEvent){
		Object.entries(properties).forEach(([key, value]) => {
            this.setPropertyValue(key, value, supressEvent);
        });

        return this;
    }

    /**
     * Show/hide
     *
     * @method toggleVisibility
     * @param {Boolean} [show=undefined] Whether to show or hide the component. If undefined, the visibility will be toggle
     * @chainable
     */
    toggleVisibility(show){

        if(show === true){
            this.data('hidden', null);
        }
        else if(show === false){
            this.data('hidden', "true");
        }
        else{
            this.data('hidden', (this.data('hidden') === "true") ? null : "true");
        }

        return this;

    }

    /**
     * Set a cuepoint on the component
     *
     * @method setCuePoint
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
     * @method getCuePoint
     * @return {player.CuePoint} The cuepoint
     */
    getCuePoint() {
        return this.cuepoint;
    }

}
