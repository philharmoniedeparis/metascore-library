/**
* Description
*
* @class player.component.element.Cursor
* @extends player.component.Element
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
     * Description
     * @constructor
     * @param {} configs
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
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    return this.data('direction');
                },
                /**
                 * Description
                 * @param {} value
                 * @return
                 */
                'setter': function(value){
                    this.data('direction', value);
                }
            },
            'acceleration': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.element.Cursor.acceleration', 'Acceleration')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    return this.data('accel');
                },
                /**
                 * Description
                 * @param {} value
                 * @return
                 */
                'setter': function(value){
                    this.data('accel', value);
                }
            },
            'cursor-width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.element.Cursor.cursor-width', 'Cursor width')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return ConditionalExpression
                 */
                'getter': function(skipDefault){
                    var value = this.cursor.css('width', undefined, skipDefault);
                    return value !== null ? parseInt(value, 10) : null;
                },
                /**
                 * Description
                 * @param {} value
                 * @return
                 */
                'setter': function(value){
                    this.cursor.css('width', value +'px');
                }
            },
            'cursor-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.element.Cursor.cursor-color', 'Cursor color')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                     return this.cursor.css('background-color', undefined, skipDefault);
                },
                /**
                 * Description
                 * @param {} value
                 * @return
                 */
                'setter': function(value){
                    var color = metaScore.Color.parse(value);
                    this.cursor.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
                }
            }
        })
    };

    /**
     * Description
     * @method setupDOM
     * @return
     */
    Cursor.prototype.setupDOM = function(){
        // call parent function
        Cursor.parent.prototype.setupDOM.call(this);

        this.data('type', 'Cursor');

        this.cursor = new metaScore.Dom('<div/>', {'class': 'cursor'})
            .appendTo(this.contents);

        this
            .addListener('click', metaScore.Function.proxy(this.onClick, this))
            .addListener('dblclick', metaScore.Function.proxy(this.onClick, this));
    };

    /**
     * Description
     * @method onClick
     * @param {} evt
     * @return
     */
    Cursor.prototype.onClick = function(evt){
        var pos, time,
            inTime, outTime,
            direction, acceleration,
            rect;

        if(metaScore.editing && evt.type !== 'dblclick'){
            return;
        }

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
     * Description
     * @method onCuePointUpdate
     * @param {} cuepoint
     * @param {} curTime
     * @return
     */
    Cursor.prototype.onCuePointUpdate = function(cuepoint, curTime){
        var width, height,
            inTime, outTime, pos,
            direction = this.getProperty('direction'),
            acceleration = this.getProperty('acceleration');

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