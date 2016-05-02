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