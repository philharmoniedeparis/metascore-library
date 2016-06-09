/**
 * @module Player
 */

metaScore.namespace('player.component.element').Cursor = (function () {

    /**
     * Fired when a cursor is clicked, requesting a time update
     *
     * @event time
     * @param {Object} element The element instance
     * @param {Number} time The time value according to the click position
     */
    var EVT_TIME = 'time';

    /**
     * A cursor element
     *
     * @class Cursor
     * @namespace player.component.element
     * @extends player.component.Element
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    function Cursor(configs) {
        // call parent constructor
        Cursor.parent.call(this, configs);
    }

    metaScore.player.component.Element.extend(Cursor);

    Cursor.defaults = {
        'properties': metaScore.Object.extend({}, metaScore.player.component.Element.defaults.properties, {
            'direction': {
                'type': 'Select',
                'configs': {
                    'label': metaScore.Locale.t('player.component.element.Cursor.direction', 'Direction'),
                    'options': {
                        'right': metaScore.Locale.t('player.component.element.Cursor.direction.right', 'Left > Right'),
                        'left': metaScore.Locale.t('player.component.element.Cursor.direction.left', 'Right > Left'),
                        'bottom': metaScore.Locale.t('player.component.element.Cursor.direction.bottom', 'Top > Bottom'),
                        'top': metaScore.Locale.t('player.component.element.Cursor.direction.top', 'Bottom > Top'),
                    }
                },
                'getter': function(skipDefault){
                    return this.data('direction');
                },
                'setter': function(value){
                    this.data('direction', value);
                }
            },
            'acceleration': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.element.Cursor.acceleration', 'Acceleration')
                },
                'getter': function(skipDefault){
                    return this.data('accel');
                },
                'setter': function(value){
                    this.data('accel', value);
                }
            },
            'cursor-width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.element.Cursor.cursor-width', 'Cursor width')
                },
                'getter': function(skipDefault){
                    var value = parseInt(this.cursor.css('width', undefined, skipDefault), 10);
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.cursor.css('width', value +'px');
                }
            },
            'cursor-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.element.Cursor.cursor-color', 'Cursor color')
                },
                'getter': function(skipDefault){
                     return this.cursor.css('background-color', undefined, skipDefault);
                },
                'setter': function(value){
                    var color = metaScore.Color.parse(value);
                    this.cursor.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
                }
            }
        })
    };

    /**
     * Setup the cursor's UI
     * 
     * @method setupUI
     * @private
     */
    Cursor.prototype.setupUI = function(){
        // call parent function
        Cursor.parent.prototype.setupUI.call(this);

        this.data('type', 'Cursor');

        this.cursor = new metaScore.Dom('<div/>', {'class': 'cursor'})
            .appendTo(this.contents);

        this.addListener('click', metaScore.Function.proxy(this.onClick, this));
    };

    /**
     * The click event handler
     *
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    Cursor.prototype.onClick = function(evt){
        var pos, time,
            inTime, outTime,
            direction, acceleration,
            rect;

        inTime = this.getProperty('start-time');
        outTime = this.getProperty('end-time');
        direction = this.getProperty('direction');
        acceleration = this.getProperty('acceleration');
        rect = evt.target.getBoundingClientRect();

        switch(direction){
            case 'left':
                pos = (rect.right - evt.clientX) / this.getProperty('width');
                break;

            case 'bottom':
                pos = (evt.clientY - rect.top) / this.getProperty('height');
                break;

            case 'top':
                pos = (rect.bottom - evt.clientY) / this.getProperty('height');
                break;

            default:
                pos = (evt.clientX - rect.left) / this.getProperty('width');
        }

        if(!acceleration || acceleration === 1){
            time = inTime + ((outTime - inTime) * pos);
        }
        else{
            time = inTime + ((outTime - inTime) * Math.pow(pos, 1/acceleration));
        }

        this.triggerEvent(EVT_TIME, {'element': this, 'value': time});
    };

    /**
     * The cuepoint start event handler
     *
     * @method onCuePointStart
     * @private
     * @param {Event} evt The event object
     */
    Cursor.prototype.onCuePointStart = function(evt){
        Cursor.parent.prototype.onCuePointStart.call(this, evt);
        
        this.onCuePointUpdate(evt);
    };

    /**
     * The cuepoint update event handler
     *
     * @method onCuePointUpdate
     * @private
     * @param {Event} evt The event object
     */
    Cursor.prototype.onCuePointUpdate = function(evt){
        var width, height,
            curTime, inTime, outTime, pos,
            direction = this.getProperty('direction'),
            acceleration = this.getProperty('acceleration');

        curTime = evt.target.getMedia().getTime();
        inTime = this.getProperty('start-time');
        outTime = this.getProperty('end-time');

        if(!acceleration || acceleration === 1){
            pos = (curTime - inTime)    / (outTime - inTime);
        }
        else{
            pos = Math.pow((curTime - inTime) / (outTime - inTime), acceleration);
        }

        switch(direction){
            case 'left':
                width = this.getProperty('width');
                pos = Math.min(width * pos, width);
                this.cursor.css('right', pos +'px');
                break;

            case 'bottom':
                height = this.getProperty('height');
                pos = Math.min(height * pos, height);
                this.cursor.css('top', pos +'px');
                break;

            case 'top':
                height = this.getProperty('height');
                pos = Math.min(height * pos, height);
                this.cursor.css('bottom', pos +'px');
                break;

            default:
                width = this.getProperty('width');
                pos = Math.min(width * pos, width);
                this.cursor.css('left', pos +'px');
        }
    };

    return Cursor;

})();