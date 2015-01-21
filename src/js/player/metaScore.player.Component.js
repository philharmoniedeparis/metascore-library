/**
 * Player Component
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */

metaScore.namespace('player').Component = (function () {

  function Component(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    Component.parent.call(this, '<div/>', {'class': 'metaScore-component', 'id': 'componenet-'+ metaScore.String.uuid(5)});

    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;

    if(this.configs.container){
      this.appendTo(this.configs.container);
    }

    metaScore.Object.each(this.configs.listeners, function(key, value){
      this.addListener(key, value);
    }, this);

    this.setupDOM();

    metaScore.Object.each(this.configs, function(key, value){
      this.setProperty(key, value);
    }, this);
  }

  metaScore.Dom.extend(Component);

  Component.defaults = {
    'properties': {}
  };

  Component.prototype.setupDOM = function(){};

  Component.prototype.getId = function(){
    return this.attr('id');
  };

  Component.prototype.getName = function(){
    return this.getProperty('name');
  };

  Component.prototype.hasProperty = function(name){
    return name in this.configs.properties;
  };

  Component.prototype.getProperty = function(name){
    if(this.hasProperty(name) && 'getter' in this.configs.properties[name]){
      return this.configs.properties[name].getter.call(this);
    }
  };

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

  Component.prototype.setProperty = function(name, value){
    if(name in this.configs.properties && 'setter' in this.configs.properties[name]){
      this.configs.properties[name].setter.call(this, value);
      this.triggerEvent('propchange', {'component': this, 'property': name, 'value': value});
    }
  };

  Component.prototype.setCuePoint = function(configs){
    var inTime = this.getProperty('start-time'),
      outTime = this.getProperty('end-time');

    if(this.cuepoint){
      this.cuepoint.destroy();
    }

    if(inTime != null || outTime != null){
      this.cuepoint = new metaScore.player.CuePoint(metaScore.Object.extend({}, configs, {
        'inTime': inTime,
        'outTime': outTime - 1,
        'onStart': this.onCuePointStart ? metaScore.Function.proxy(this.onCuePointStart, this) : null,
        'onUpdate': this.onCuePointUpdate ? metaScore.Function.proxy(this.onCuePointUpdate, this) : null,
        'onEnd': this.onCuePointEnd ? metaScore.Function.proxy(this.onCuePointEnd, this) : null
      }));
    }

    return this.cuepoint;
  };

  return Component;

})();