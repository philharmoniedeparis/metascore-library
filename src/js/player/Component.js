import Dom from '../core/Dom';
import Locale from '../core/Locale';
import Draggable from '../core/ui/Draggable';
import Resizable from '../core/ui/Resizable';
import {isArray, isFunction, isString} from '../core/utils/Var';
import {uuid} from '../core/utils/String';
import {map, round} from '../core/utils/Math';
import {MasterClock} from '../core/media/MediaClock';
import CuePoint from './CuePoint';

/**
 * A generic component class
 *
 * @emits {propchange} Fired when a property changed
 * @param {Component} component The component instance
 * @param {String} property The name of the property
 * @param {Mixed} value The new value of the property
 * @param {Mixed} previous The previous value of the property
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

    static defaults = {
        'draggable': true,
        'resizable': true,
        'name': 'untitled',
        'position': [0, 0],
        'dimension': [50,50],
        'scale': [1,1],
        'opacity': 1
    };

    /**
     * Get all properties
     *
     * @return {Object[]} The properties
     */
    static getProperties() {
        if (!this.properties) {
            this.properties = {
                'type': {
                    'type': 'string',
                    'label': Locale.t('Component.properties.type.label', 'Type'),
                    'getter': function(){
                        return this.constructor.getType();
                    }
                },
                'id': {
                    'type': 'string',
                    'label': Locale.t('Component.properties.id.label', 'ID')
                },
                'name': {
                    'type': 'string',
                    'label': Locale.t('Component.properties.name.label', 'Name')
                },
                'hidden': {
                    'type': 'boolean',
                    'label': Locale.t('Component.properties.hidden.label', 'Hidden')
                },
                'position': {
                    'type': 'array',
                    'label': Locale.t('Component.properties.position.label', 'Position')
                },
                'dimension': {
                    'type': 'array',
                    'label': Locale.t('Component.properties.dimension.label', 'Dimension'),
                    'getter': function () {
                        // Get value from CSS to honor CSS min and max values.
                        return [
                            parseInt(this.css('width'), 10),
                            parseInt(this.css('height'), 10),
                        ];
                    }
                },
                'scale': {
                    'type': 'array',
                    'label': Locale.t('Component.properties.scale.label', 'Scale'),
                    'animatable': true,
                    'animated': function (value) {
                        return isArray(value[1]);
                    }
                },
                'background-color': {
                    'type': 'color',
                    'label': Locale.t('Component.properties.background-color.label', 'Background color')
                },
                'background-image': {
                    'type': 'image',
                    'label': Locale.t('Component.properties.background-image.label', 'Background image')
                },
                'border-width': {
                    'type': 'number',
                    'label': Locale.t('Component.properties.border-width.label', 'Border width')
                },
                'border-color': {
                    'type': 'color',
                    'label': Locale.t('Component.properties.border-color.label', 'Border color')
                },
                'border-radius': {
                    'type': 'string',
                    'label': Locale.t('Component.properties.border-radius.label', 'Border radius')
                },
                'opacity': {
                    'type': 'number',
                    'label': Locale.t('Component.properties.opacity.label', 'Opacity'),
                    'animatable': true
                },
                'start-time': {
                    'type': 'time',
                    'label': Locale.t('Component.properties.start-time.label', 'Start time'),
                    'sanitize': function (value) {
                        return value ? round(value, 2) : value;
                    }
                },
                'end-time': {
                    'type': 'time',
                    'label': Locale.t('Component.properties.end-time.label', 'End time'),
                    'sanitize': function (value) {
                        return value ? round(value, 2) : value;
                    }
                },
                'editor.locked': {
                    'type': 'boolean',
                    'label': Locale.t('Component.properties.editor-locked.label', 'Locked')
                }
            };
        }

        return this.properties;
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
    * Get the types of the component and its parent classes
    *
    * @return {Array} The component's types
    */
    static getTypes(){
        let types = [];

        const parent = Object.getPrototypeOf(this);
        if('getTypes' in parent){
            types = types.concat(parent.getTypes());
        }

        types.push(this.getType());

        return types;
    }

    /**
    * Check if the component is an instance of a component type
    *
    * @param {String|Array} type The type(s) to check for
    * @return {Boolean} Whether the component is of the specified type or a sub-type
    */
    static instanceOf(type){
        if (isArray(type)) {
            return type.some((t) => this.instanceOf(t));
        }

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
     * Instantiate
     *
     * @abstract
     * @param {Object} configs Custom configs to override defaults
     * @property {Mixed} [draggable=true] Wether the component can be dragged, or the component's drag target
     * @property {Mixed} [resizable=true] Wether the component can be resized, or the component's resize target
     * @property {Object} [properties={}] A list of the component properties as name/descriptor pairs
     */
    constructor(configs) {
        if (new.target === Component) {
            // This is an abstract class.
            throw new TypeError(`Cannot construct ${new.target.name} instances directly`);
        }

        // call parent constructor
        super('<div/>', {'class': 'metaScore-component'});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({'id': `component-${uuid(10)}`}, this.constructor.defaults, configs);

        /**
         * The property values store
         * @type {Object}
         */
        this.property_values = {};

        /**
         * The animatable properties cuepoints
         * @type {Object}
         */
        this.property_cuepoints = {};

        // keep a reference to this class instance in the DOM node
        this.get(0)._metaScore = this;
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
        return this.constructor.getProperties()[name];
    }

    /**
     * Get all properties
     *
     * @return {Object[]} The properties
     */
    getProperties(){
        return this.constructor.getProperties();
    }

    /**
     * Get the value of a given property
     *
     * @param {String} name The name of the property
     * @param {Boolean} [skipID=false] Whether to skip the 'id' property, see getPropertyValues
     * @return {Mixed} The value of the property
     */
    getPropertyValue(name, skipID){
        const prop = this.getProperty(name);
        if(prop){
            if(!('applies' in prop) || !isFunction(prop.applies) || prop.applies.call(this)){
                // Return the value retreived from the property's getter.
                if('getter' in prop){
                    return prop.getter.call(this, skipID);
                }

                // Return the stored value
                if(name in this.property_values){
                    return this.property_values[name];
                }
            }
        }

        return null;
    }

    /**
     * Get the values of all properties
     *
     * @param {Boolean} [skipID=false] Whether to skip the 'id' property, usefull when cloning
     * @return {Object} The values of the properties as name/value pairs
     */
    getPropertyValues(skipID){
        const values = {};

		Object.keys(this.getProperties()).forEach((name) => {
            // Skip if this is an id property and the skipID argument is true.
            if(skipID === true && name === 'id'){
                return;
            }

            const value = this.getPropertyValue(name, skipID);
            if(value !== null){
                values[name] = value;
            }
        });

        return values;
    }

    /**
     * Get the value of an animated property at a specific time.
     *
     * @param {String} name The name of the property
     * @param {number} time The time in seconds
     * @return {Mixed} The value of the property
     */
    getPropertyValueAtTime(name, time){
        const values = this.getPropertyValue(name).sort((a, b) => {
            return a[0] - b[0];
        });

        // Find the index of the value with the smallest time
        // greater than the desired time.
        const index = values.findIndex((value) => {
            return value[0] >= time;
        });

        if (index === -1) {
            // No value found after desired time,
            // return the last value.
            return values[values.length-1][1];
        }

        if (index === 0) {
            // No value found before desired time,
            // return first value.
            return values[index][1];
        }

        if (time === values[index][0]) {
            // Desired time matches a value's time,
            // return that value.
            return values[index][1];
        }

        // Claculate the intermediate.
        const start = values[index-1];
        const end = values[index];

        if (isArray(start[1])) {
            return start[1].map((v, index) => {
                return map(time, start[0], end[0], start[1][index], end[1][index]);
            });
        }

        return map(time, start[0], end[0], start[1], end[1]);
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
        const prop = this.getProperty(name);
        if(prop){
            const previous_value = this.getPropertyValue(name);
            let new_value = value;

            const animatable = this.isPropertyAnimatable(name);
            const animated = animatable && this.isPropertyAnimated(name, new_value);

            if (animated) {
                new_value.sort((a, b) => a[0] - b[0]);
            }

            if(('sanitize' in prop) && isFunction(prop.sanitize)){
                if (animated) {
                    // Sanitize each value.
                    new_value.forEach((v) => {
                        v[1] = prop.sanitize.call(this, v[1]);
                    });
                }
                else {
                    new_value = prop.sanitize.call(this, new_value);
                }
            }

            if(previous_value !== new_value){
                if(new_value === null){
                    delete this.property_values[name];
                }
                else{
                    this.property_values[name] = new_value;
                }

                if (animatable){
                    this.removePropertyCuepoint(name);
                }
                this.updatePropertyValue(name, new_value);

                if(supressEvent !== true){
                    this.triggerEvent('propchange', {'component': this, 'property': name, 'value': new_value, 'previous': previous_value}, false);
                }
            }
        }

        return this;
    }

    /**
     * Set property values
     *
     * @param {Object} names The list of properties to set as name/value pairs
     * @param {Boolean} [supressEvent=false] Whether to supress the propchange event
     * @return {this}
     */
    setPropertyValues(names, supressEvent){
        Object.entries(names).forEach(([name, value]) => {
            this.setPropertyValue(name, value, supressEvent);
        });

        return this;
    }

    /**
     * Check if a property is animatable.
     *
     * @protected
     * @param {String} name The name of the property
     * @return {Boolean} Whether the property is animatable.
     */
    isPropertyAnimatable(name){
        const prop = this.getProperty(name);
        return prop && prop.animatable;
    }

    /**
     * Check if a property is animated.
     *
     * @protected
     * @param {String} name The name of the property
     * @param {Mixed} value The value to set
     * @return {Boolean} Whether the property is animated.
     */
    isPropertyAnimated(name, value){
        const prop = this.getProperty(name);
        if(prop && ('animated' in prop) && isFunction(prop.animated)){
            return prop.animated.call(this, value);
        }

        return isArray(value) && this.isPropertyAnimatable(name);
    }

    /**
     * Update a property value
     *
     * @protected
     * @param {String} name The name of the property
     * @param {Mixed} value The value to set
     * @return {this}
     */
    updatePropertyValue(name, value){
        if(this.isPropertyAnimated(name, value)) {
            return this.updateAnimatedPropertyValue(name);
        }

        switch(name){
            case 'id':
                this.attr('id', value);
                break;

            case 'name':
                this.data(name, value);
                break;

            case 'hidden':
                this.toggleClass(name, value);
                break;

            case 'position':
                this.css('left', `${value[0]}px`);
                this.css('top', `${value[1]}px`);
                break;

            case 'dimension':
                this.css('width', `${value[0]}px`);
                this.css('height', `${value[1]}px`);
                break;

            case 'scale':
                this.css(`--transform-${name}X`, value[0]);
                this.css(`--transform-${name}Y`, value[1]);
                break;

            case 'background-color':
            case 'border-color':
            case 'border-radius':
                this.css(name, value);
                break;

            case 'border-width':
                this.css(name, `${value}px`);
                break;

            case 'background-image':
                {
                    const css_value = (value !== 'none' && isString(value) && (value.length > 0)) ? `url(${value})` : null;
                    this.css('background-image', css_value);
                }
                break;

            case 'start-time':
            case 'end-time':
                this.setCuePoint();
                break;

            case 'editor.locked':
                this.toggleClass('editor-locked', value);
                break;
        }

        return this;
    }

    /**
     * Remove an animated propoerty's cuepoint.
     *
     * @protected
     * @param {String} name The name of the property
     * @return {this}
     */
    removePropertyCuepoint(name) {
        if(name in this.property_cuepoints) {
            this.property_cuepoints[name].deactivate();
            delete this.property_cuepoints[name];
        }

        return this;
    }

    /**
     * Update an animated property value
     *
     * @protected
     * @param {String} name The name of the property
     * @param {Array} values The values to set
     * @return {this}
     */
    updateAnimatedPropertyValue(name) {
        const values = this.getPropertyValue(name);

        this.removePropertyCuepoint(name);

        // The values are empty.
        if(values.length === 0){
            return this.updatePropertyValue(name, null);
        }

        // Only one value is provided.
        if(values.length === 1){
            return this.updatePropertyValue(name, values[0][1]);
        }

        // There's no need for inTime and outTime
        // as the cuepoint is (de)activated
        // with the (de)activation of the component.
        const cuepoint = new CuePoint()
            .addListener('update', () => {
                const time = MasterClock.getTime();
                const value = this.getPropertyValueAtTime(name, time);
                this.updatePropertyValue(name, value);
            });

        if(this.isActive()){
            cuepoint.activate();
        }

        this.property_cuepoints[name] = cuepoint;

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

        if(this.getPropertyValue('editor.locked') && draggable){
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

        if(this.getPropertyValue('editor.locked') && resizable){
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
        }

        if(active){
            this.activate(false ,true);
        }

        if(supressEvent !== true){
            this.triggerEvent('cuepointset', {'component': this, 'cuepoint': this.cuepoint});
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
     * @protected
     */
    onCuePointStart(){
        this.doActivate();
    }

    /**
     * The cuepoint update event handler
     *
     * @abstract
     * @protected
     */
    onCuePointUpdate(){
        // This is an abstract callback.
    }

    /**
     * The cuepoint stop event handler
     *
     * @protected
     */
    onCuePointStop(){
        this.doDeactivate();
    }

    /**
     * Activate the element
     *
     * @param {Boolean} [supressEvent=false] Whether to supress the activate event
     * @param {Boolean} [force=false] Whether to force the re-activation
     * @return {this}
     */
    activate(supressEvent, force){
        if(!this.isActive() || force === true){
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

        Object.values(this.property_cuepoints).forEach((cuepoint) => {
            cuepoint.activate();
        });

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

        Object.values(this.property_cuepoints).forEach((cuepoint) => {
            cuepoint.deactivate();
        });

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
