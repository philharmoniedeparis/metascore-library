/**
 * TimeField
 *
 * @requires ../metaScore.editor.field.js
 */

metaScore.namespace('editor.field').Time = (function () {

  function TimeField(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    TimeField.parent.call(this, this.configs);

    this.addClass('timefield');
  }

  TimeField.defaults = {
    /**
    * Defines the default value
    */
    value: 0,

    /**
    * Defines the minimum value allowed
    */
    min: 0,

    /**
    * Defines the maximum value allowed
    */
    max: null,

    checkbox: false,

    inButton: false,

    outButton: false
  };

  metaScore.editor.Field.extend(TimeField);

  TimeField.prototype.setupUI = function(){
    var buttons;

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'text': this.configs.label})
        .appendTo(this);
    }
      
    this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
      .appendTo(this);

    if(this.configs.checkbox){
      this.checkbox = new metaScore.Dom('<input/>', {'type': 'checkbox'})
        .addListener('change', metaScore.Function.proxy(this.onInput, this))
        .appendTo(this.input_wrapper);
     }

    this.hours = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'hours'})
      .addListener('input', metaScore.Function.proxy(this.onInput, this))
      .appendTo(this.input_wrapper);

    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'})
      .appendTo(this.input_wrapper);

    this.minutes = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'minutes'})
      .addListener('input', metaScore.Function.proxy(this.onInput, this))
      .appendTo(this.input_wrapper);

    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'})
      .appendTo(this.input_wrapper);

    this.seconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'seconds'})
      .addListener('input', metaScore.Function.proxy(this.onInput, this))
      .appendTo(this.input_wrapper);

    new metaScore.Dom('<span/>', {'text': '.', 'class': 'separator'})
      .appendTo(this.input_wrapper);

    this.centiseconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'centiseconds'})
      .addListener('input', metaScore.Function.proxy(this.onInput, this))
      .appendTo(this.input_wrapper);

    if(this.configs.inButton || this.configs.outButton){
      buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
        .appendTo(this.input_wrapper);

      if(this.configs.inButton){
        this.in = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'in'})
          .addListener('click', metaScore.Function.proxy(this.onInClick, this))
          .appendTo(buttons);
      }

      if(this.configs.outButton){
        this.out = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'out'})
          .addListener('click', metaScore.Function.proxy(this.onOutClick, this))
          .appendTo(buttons);
      }
    }

    this.addListener('change', metaScore.Function.proxy(this.onChange, this));

  };

  TimeField.prototype.onChange = function(evt){
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  };

  TimeField.prototype.onInput = function(evt){
    var active = this.isActive(),
      centiseconds_val, seconds_val, minutes_val, hours_val;

    if(active){
      centiseconds_val = parseInt(this.centiseconds.val(), 10) || 0;
      seconds_val = parseInt(this.seconds.val(), 10) || 0;
      minutes_val = parseInt(this.minutes.val(), 10) || 0;
      hours_val = parseInt(this.hours.val(), 10) || 0;

      this.setValue((centiseconds_val * 10) + (seconds_val * 1000) + (minutes_val * 60000) + (hours_val * 3600000));
    }
    else{
      this.setValue(null);
    }

    evt.stopPropagation();
  };

  TimeField.prototype.onInClick = function(evt){
    this.triggerEvent('valuein');
  };

  TimeField.prototype.onOutClick = function(evt){
    this.triggerEvent('valueout');
  };

  TimeField.prototype.setValue = function(milliseconds, supressEvent){
    var centiseconds_val, seconds_val, minutes_val, hours_val;

    milliseconds = parseFloat(milliseconds);

    if(isNaN(milliseconds)){
      this.value = null;

      this.centiseconds.val(0);
      this.seconds.val(0);
      this.minutes.val(0);
      this.hours.val(0);

      if(!this.disabled){
        this.hours.attr('disabled', 'disabled');
        this.minutes.attr('disabled', 'disabled');
        this.seconds.attr('disabled', 'disabled');
        this.centiseconds.attr('disabled', 'disabled');

        if(this.in){
          this.in.attr('disabled', 'disabled');
        }
        if(this.out){
          this.out.attr('disabled', 'disabled');
        }
      }

      if(this.checkbox){
        this.checkbox.attr('checked', null);
      }
    }
    else{
      this.value = milliseconds;

      if(this.configs.min !== null){
        this.value = Math.max(this.value, this.configs.min);
      }
      if(this.configs.max !== null){
        this.value = Math.min(this.value, this.configs.max);
      }

      centiseconds_val = parseInt((this.value / 10) % 100, 10) || 0;
      seconds_val = parseInt((this.value / 1000) % 60, 10) || 0;
      minutes_val = parseInt((this.value / 60000) % 60, 10) || 0;
      hours_val = parseInt((this.value / 3600000), 10) || 0;

      if(!this.disabled){
        this.hours.attr('disabled', null);
        this.minutes.attr('disabled', null);
        this.seconds.attr('disabled', null);
        this.centiseconds.attr('disabled', null);

        if(this.in){
          this.in.attr('disabled', null);
        }
        if(this.out){
          this.out.attr('disabled', null);
        }
      }

      this.centiseconds.val(centiseconds_val);
      this.seconds.val(seconds_val);
      this.minutes.val(minutes_val);
      this.hours.val(hours_val);

      if(this.checkbox){
        this.checkbox.attr('checked', 'checked');
      }
    }

    if(supressEvent !== true){
      this.triggerEvent('change');
    }
  };

  /**
  *
  */
  TimeField.prototype.isActive = function(){
    return !this.checkbox || this.checkbox.is(":checked");
  };

  /**
  * Disable the button
  * @returns {object} the XMLHttp object
  */
  TimeField.prototype.disable = function(){
    this.disabled = true;

    if(this.checkbox){
      this.checkbox.attr('disabled', 'disabled');
    }

    this.hours.attr('disabled', 'disabled');
    this.minutes.attr('disabled', 'disabled');
    this.seconds.attr('disabled', 'disabled');
    this.centiseconds.attr('disabled', 'disabled');

    if(this.in){
      this.in.attr('disabled', 'disabled');
    }
    if(this.out){
      this.out.attr('disabled', 'disabled');
    }

    this.addClass('disabled');

    return this;
  };

  /**
  * Enable the button
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  TimeField.prototype.enable = function(){
    var active = this.isActive();

    this.disabled = false;

    if(this.checkbox){
      this.checkbox.attr('disabled', null);
    }

    this.hours.attr('disabled', active ? null : 'disabled');
    this.minutes.attr('disabled', active ? null : 'disabled');
    this.seconds.attr('disabled', active ? null : 'disabled');
    this.centiseconds.attr('disabled', active ? null : 'disabled');

    if(this.in){
      this.in.attr('disabled', active ? null : 'disabled');
    }
    if(this.out){
      this.out.attr('disabled', active ? null : 'disabled');
    }

    this.removeClass('disabled');

    return this;
  };

  return TimeField;

})();