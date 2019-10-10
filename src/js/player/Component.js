import Dom from '../core/Dom';
import Draggable from '../core/ui/Draggable';
import Resizable from '../core/ui/Resizable';
import {isFunction} from '../core/utils/Var';
import {uuid} from '../core/utils/String';
import CuePoint from './CuePoint';

/**
 * A generic component class
 *
 * @emits {propchange} Fired when a property changed
 * @param {Component} component The component instance
 * @param {String} property The name of the property
 * @param {Mixed} value The new value of the property
 * @param {Mixed} old The old value of the property
 *
 * @emits {activate} Fired when the component is activated
 * @param {Component} component The component instance
 *
 * @emits {deactivate} Fired when the component is deactivated
 * @param {Component} component The component instance
 *
 * @emits {cuepointset} Fired when a cue point is set
 * @param {Component} component The component instance
 * @param {CuePoint} cuepoint The cuepoint
 */
export default class Component extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Mixed} [draggable=true] Wether the component can be dragged, or the component's drag target
     * @property {Mixed} [resizable=true] Wether the component can be resized, or the component's resize target
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

        this
            .setupUI()
            .addListener('propchange', this.onPropChange.bind(this));
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'id': `component-${uuid(10)}`,
            'index': null,
            'draggable': true,
            'resizable': true,
            'properties': {
                'id': {
                    'type': 'string',
                    'getter': function(){
                        return this.attr('id');
                    },
                    'setter': function(value){
                        this.attr('id', value);
                    }
                }
            }
        };
    }

    /**
    * Get the component's type
    *
    * @return {String} The component's type
    */
    static getType(){
        return this.name;
    }

    /**
    * Get the types of the component and its parent classes
    *
    * @return {Array} The component's types
    */
    static getTypes(){
        let types = [this.getType()];

        const parent = Object.getPrototypeOf(this);
        if('getTypes' in parent){
            types = types.concat(parent.getTypes());
        }

        return types;
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
     * Initialize property values with configs
    *
    * @return {this}
     */
    init(){
        this.setPropertyValues(this.configs);
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
     * Get the component's type
     *
     * @return {String} The component's type
     */
    getType() {
        return this.constructor.getType();
    }

    /**
     * Get the types of the component and its parent classes
     *
     * @return {Array} The component's types
     */
    getTypes() {
        return this.constructor.getTypes();
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
            const old_value = this.getPropertyValue(name);

            // Only update if the value has changed
            if(old_value !== value){
                this.configs.properties[name].setter.call(this, value);

                if(supressEvent !== true){
                    this.triggerEvent('propchange', {'component': this, 'property': name, 'value': value, 'old': old_value});
                }
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

    onPropChange(evt){
        if(evt.target !== evt.currentTarget){
            // Caught a bubbled event, skip
            return;
        }

        this.onOwnPropChange(evt);
    }

    onOwnPropChange(evt){
        const property = evt.detail.property;
        if((property === 'start-time') || (property === 'end-time')){
            this.setCuePoint();
        }
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
     * Get the parent component
     *
     * @return {Component} The parent component
     */
    getParent(){
        const dom = this.parents().closest('.metaScore-component');

        return dom ? dom._metaScore : null;
    }

    /**
     * Get the child components
     *
     * @return {Array} A list of child components
     */
    getChildren(){
        const children = [];

        this.children('.metaScore-component').forEach((dom) => {
            children.push(dom._metaScore);
        });

        return children;
    }

    /**
     * Get the count of children
     *
     * @return {Integer} The number of children
     */
    getChildrenCount() {
        return this.children('.metaScore-component').count();
    }

    /**
     * Remove all pages
     *
     * @return {this}
     */
    removeAllChildren() {
        this.children('.metaScore-component').remove();

        return this;
    }

    /**
     * Get a child component by index
     *
     * @param {Integer} index The child's index
     * @return {Component} The component
     */
    getChild(index){
        const child = this.child(`.metaScore-component:nth-child(${index+1})`).get(0);

        return child ? child._metaScore : null;
    }

    /**
     * Get the index of a child component
     *
     * @param {Component} child The child component
     * @return {Integer} The child's index
     */
    getChildIndex(child){
        return this.getChildren().indexOf(child);
    }

    /**
     * Set/Unset the draggable behaviour
     *
     * @param {Boolean} [draggable=true] Whether to activate or deactivate the draggable
     * @return {this}
     */
    setDraggable(draggable){
        if(!this.configs.draggable){
            return this;
        }

        if(this.getPropertyValue('locked') && draggable){
            return this;
        }

        if(draggable && !this._draggable){
            /**
             * The draggable behavior
             * @type {Draggable}
             */
            this._draggable = new Draggable(this.getDraggableConfigs());
        }
        else if(!draggable && this._draggable){
            this._draggable.destroy();
            delete this._draggable;
        }

        return this;
    }

    getDraggableConfigs(){
        return {
            'target': this,
            'handle': this,
            'autoUpdate': false
        };
    }

    /**
     * Get the draggable behaviour
     *
     * @return {Draggable} The draggable behaviour
     */
    getDraggable(){
        return this._draggable;
    }

    /**
     * Set/Unset the resizable behaviour
     *
     * @param {Boolean} [resizable=true] Whether to activate or deactivate the resizable
     * @return {this}
     */
    setResizable(resizable){
        if(!this.configs.resizable){
            return this;
        }

        if(this.getPropertyValue('locked') && resizable){
            return this;
        }

        if(resizable && !this._resizable){
            /**
             * The resizable behavior
             * @type {Resizable}
             */
            this._resizable = new Resizable({
                'target': this,
                'autoUpdate': false
            });
        }
        else if(!resizable && this._resizable){
            this._resizable.destroy();
            delete this._resizable;
        }

        return this;
    }

    /**
     * Get the resizable behaviour
     *
     * @return {Resizable} The resizable behaviour
     */
    getResizable(){
        return this._resizable;
    }

    /**
     * Set a cuepoint on the component
     *
     * @param {Boolean} [supressEvent=false] Whether to supress the cuepointset event
     * @return {this}
     */
    setCuePoint(supressEvent){
        const active = this.isActive();
        const start_time = this.getPropertyValue('start-time');
        const end_time = this.getPropertyValue('end-time');

        if(this.cuepoint){
            this.cuepoint.deactivate();
            delete this.cuepoint;
        }

        if(start_time !== null || end_time !== null){
            /**
             * A cuepoint associated with the component
             * @type {CuePoint}
             */
            this.cuepoint = new CuePoint({
                    'inTime': start_time,
                    'outTime': end_time
                })
                .addListener('start', this.onCuePointStart.bind(this))
                .addListener('update', this.onCuePointUpdate.bind(this))
                .addListener('stop', this.onCuePointStop.bind(this));

            if(supressEvent !== true){
                this.triggerEvent('cuepointset', {'component': this, 'cuepoint': this.cuepoint});
            }

            if(active){
                this.activate();
            }
        }

        return this;
    }

    /**
     * Get the cuepoint of the component
     *
     * @return {player.CuePoint} The cuepoint
     */
    getCuePoint() {
        return this.cuepoint;
    }

    /**
     * The cuepoint start event handler
     *
     * @private
     */
    onCuePointStart(){
        this.doActivate();
    }

    /**
     * The cuepoint update event handler
     *
     * @private
     */
    onCuePointUpdate(){

    }

    /**
     * The cuepoint stop event handler
     *
     * @private
     */
    onCuePointStop(){
        this.doDeactivate();
    }

    /**
     * Activate the element
     *
     * @param {Boolean} [supressEvent=false] Whether to supress the activate event
     * @return {this}
     */
    activate(supressEvent){
        if(!this.isActive()){
            const cuepoint = this.getCuePoint();
            if(cuepoint){
                cuepoint.activate();
            }
            else{
                this.doActivate(supressEvent);
            }
        }

        return this;
    }

    doActivate(supressEvent){
        this.active = true;
        this.addClass('active');

        this.getChildren().forEach((child) => {
            child.activate();
        });

        if(supressEvent !== true){
            this.triggerEvent('activate', {'component': this});
        }
    }

    /**
     * Deactivate the element
     *
     * @param {Boolean} [supressEvent=false] Whether to supress the deactivate event
     * @return {this}
     */
    deactivate(supressEvent){
        if(this.isActive()){
            const cuepoint = this.getCuePoint();
            if(cuepoint){
                cuepoint.deactivate();
            }
            else{
                this.doDeactivate(supressEvent);
            }
        }

        return this;
    }

    doDeactivate(supressEvent){
        delete this.active;
        this.removeClass('active');

        this.getChildren().forEach((child) => {
            child.deactivate();
        });

        if(supressEvent !== true){
            this.triggerEvent('deactivate', {'component': this});
        }
    }

    /**
     * Check if the component is active or not
     *
     * @return {Boolean} Whether the component is active or not
     */
    isActive(){
        if(this.active){
            return true;
        }

        const cuepoint = this.getCuePoint();
        return cuepoint && cuepoint.isActive();
    }

}
