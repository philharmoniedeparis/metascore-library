/**
* Description
*
* @class player.Component
* @extends Dom
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
     * Description
     * @constructor
     * @param {} configs
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

        this.setupDOM();

        this.setProperties(this.configs);
    }

    metaScore.Dom.extend(Component);

    Component.defaults = {
        'container': null,
        'index': null,
        'properties': {}
    };

    /**
     * Description
     * @method setupDOM
     * @return 
     */
    Component.prototype.setupDOM = function(){};

    /**
     * Description
     * @method getId
     * @return CallExpression
     */
    Component.prototype.getId = function(){
        return this.attr('id');
    };

    /**
     * Description
     * @method getName
     * @return CallExpression
     */
    Component.prototype.getName = function(){
        return this.getProperty('name');
    };

    /**
     * Description
     * @method instanceOf
     * @return CallExpression
     */
    Component.prototype.instanceOf = function(type){
    
        return (type in metaScore.player.component) && (this instanceof metaScore.player.component[type]);
    
    };

    /**
     * Description
     * @method hasProperty
     * @param {} name
     * @return BinaryExpression
     */
    Component.prototype.hasProperty = function(name){
        return name in this.configs.properties;
    };

    /**
     * Description
     * @method getProperty
     * @param {} name
     * @return 
     */
    Component.prototype.getProperty = function(name){
        if(this.hasProperty(name) && 'getter' in this.configs.properties[name]){
            return this.configs.properties[name].getter.call(this);
        }
    };

    /**
     * Description
     * @method getProperties
     * @param {} skipDefaults
     * @return values
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
     * Description
     * @method setProperty
     * @param {} name
     * @param {} value
     * @param {} supressEvent
     * @return 
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
     * Description
     * @method setProperties
     * @param {} name
     * @param {} value
     * @param {} supressEvent
     * @return 
     */
    Component.prototype.setProperties = function(properties, supressEvent){
        metaScore.Object.each(properties, function(key, value){
            this.setProperty(key, value, supressEvent);
        }, this);
        
        return this;
    };

    /**
     * Description
     * @method setCuePoint
     * @param {} configs
     * @return MemberExpression
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
                'outTime': outTime,
                'onStart': this.onCuePointStart ? metaScore.Function.proxy(this.onCuePointStart, this) : null,
                'onUpdate': this.onCuePointUpdate ? metaScore.Function.proxy(this.onCuePointUpdate, this) : null,
                'onEnd': this.onCuePointEnd ? metaScore.Function.proxy(this.onCuePointEnd, this) : null,
                'onSeekOut': this.onCuePointSeekOut ? metaScore.Function.proxy(this.onCuePointSeekOut, this) : null
            }));
        }

        return this.cuepoint;
    };

    /**
     * Description
     * @method setDraggable
     * @param {} draggable
     * @return MemberExpression
     */
    Component.prototype.setDraggable = function(draggable){
    
        return false;
    
    };

    /**
     * Description
     * @method setResizable
     * @param {} resizable
     * @return MemberExpression
     */
    Component.prototype.setResizable = function(resizable){
    
        return false;
    
    };

    return Component;

})();