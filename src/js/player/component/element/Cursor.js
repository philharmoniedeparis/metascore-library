import Element from '../Element';
import Dom from '../../../core/Dom';
import Locale from '../../../core/Locale';
import {toCSS} from '../../../core/utils/Color';

/**
 * Fired when a cursor is clicked, requesting a time update
 *
 * @event time
 * @param {Object} element The element instance
 * @param {Number} time The time value according to the click position
 */
const EVT_TIME = 'time';

/**
 * A cursor element
 */
export default class Cursor extends Element {

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'properties': Object.assign({}, defaults.properties, {
                'start-time': {
                    'type': 'Time',
                    'configs': {
                        'label': Locale.t('player.component.Element.start-time', 'Start time'),
                        'inButton': true,
                        'outButton': true
                    },
                    'getter': function(){
                        const value = parseFloat(this.data('start-time'));
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.data('start-time', isNaN(value) ? null : value);
                    }
                },
                'end-time': {
                    'type': 'Time',
                    'configs': {
                        'label': Locale.t('player.component.Element.end-time', 'End time'),
                        'inButton': true,
                        'outButton': true
                    },
                    'getter': function(){
                        const value = parseFloat(this.data('end-time'));
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.data('end-time', isNaN(value) ? null : value);
                    }
                },
                'direction': {
                    'type': 'Select',
                    'configs': {
                        'label': Locale.t('player.component.element.Cursor.direction', 'Direction'),
                        'options': [
                            {
                                'value': 'right',
                                'text': Locale.t('player.component.element.Cursor.direction.right', 'Left > Right')
                            },
                            {
                                'value': 'left',
                                'text': Locale.t('player.component.element.Cursor.direction.left', 'Right > Left')
                            },
                            {
                                'value': 'bottom',
                                'text': Locale.t('player.component.element.Cursor.direction.bottom', 'Top > Bottom')
                            },
                            {
                                'value': 'top',
                                'text': Locale.t('player.component.element.Cursor.direction.top', 'Bottom > Top')
                            }
                        ]
                    },
                    'getter': function(){
                        return this.data('direction');
                    },
                    'setter': function(value){
                        const cursor_width = this.getPropertyValue('cursor-width');

                        this.data('direction', value);
                        this.setPropertyValue('cursor-width', cursor_width, true);
                    }
                },
                'acceleration': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.element.Cursor.acceleration', 'Acceleration'),
                        'step': 0.01,
                        'min': 0.01
                    },
                    'getter': function(){
                        const value = parseFloat(this.data('accel'));
                        return isNaN(value) ? 1 : value;
                    },
                    'setter': function(value){
                        this.data('accel', value);
                    }
                },
                'cursor-width': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.element.Cursor.cursor-width', 'Cursor width')
                    },
                    'getter': function(skipDefault){
                        const direction = this.getPropertyValue('direction');
                        const prop = direction === 'bottom' || direction === 'top' ? 'height' : 'width';
                        const value = parseInt(this.cursor.css(prop, void 0, skipDefault), 10);
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        const direction = this.getPropertyValue('direction');
                        const prop = direction === 'bottom' || direction === 'top' ? 'height' : 'width';
                        this.cursor.css(prop, `${value}px`);
                    }
                },
                'cursor-color': {
                    'type': 'Color',
                    'configs': {
                        'label': Locale.t('player.component.element.Cursor.cursor-color', 'Cursor color')
                    },
                    'getter': function(skipDefault){
                         return this.cursor.css('background-color', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.cursor.css('background-color', toCSS(value));
                    }
                }
            })
        });
    }

    /**
    * Get the component's type
    *
    * @return {String} The component's type
    */
    static getType(){
        return 'Cursor';
    }

    /**
     * Setup the cursor's UI
     *
     * @method setupUI
     * @private
     */
    setupUI(){
        // call parent function
        super.setupUI();

        /**
         * The cursor's line
         * @type {Dom}
         */
        this.cursor = new Dom('<div/>', {'class': 'cursor'})
            .appendTo(this.contents);

        this.addListener('click', this.onClick.bind(this));

        return this;
    }

    /**
     * The click event handler
     *
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    onClick(evt){
        const inTime = this.getPropertyValue('start-time');
        const outTime = this.getPropertyValue('end-time');
        const direction = this.getPropertyValue('direction');
        const acceleration = this.getPropertyValue('acceleration') || 1;
        const rect = this.get(0).getBoundingClientRect();
        let pos = 0;

        switch(direction){
            case 'left':
                pos = (rect.right - evt.clientX) / this.getPropertyValue('width');
                break;

            case 'bottom':
                pos = (evt.clientY - rect.top) / this.getPropertyValue('height');
                break;

            case 'top':
                pos = (rect.bottom - evt.clientY) / this.getPropertyValue('height');
                break;

            default:
                pos = (evt.clientX - rect.left) / this.getPropertyValue('width');
        }

        pos = Math.pow(pos, 1/acceleration);

        const time = inTime + ((outTime - inTime) * pos);

        this.triggerEvent(EVT_TIME, {'element': this, 'value': time});
    }

    /**
     * The cuepoint update event handler
     *
     * @method onCuePointUpdate
     * @private
     * @param {Event} evt The event object
     */
    onCuePointUpdate(evt){
        const curTime = evt.target.getMedia().getTime();
        const inTime = this.getPropertyValue('start-time');
        const outTime = this.getPropertyValue('end-time');
        const direction = this.getPropertyValue('direction');
        const acceleration = this.getPropertyValue('acceleration') || 1;

        let pos = Math.pow((curTime - inTime) / (outTime - inTime), acceleration);

        switch(direction){
            case 'left':{
                const width = this.getPropertyValue('width');
                pos = Math.min(width * pos, width);
                this.cursor.css('right', `${pos}px`);
                break;
            }

            case 'bottom':{
                const height = this.getPropertyValue('height');
                pos = Math.min(height * pos, height);
                this.cursor.css('top', `${pos}px`);
                break;
            }

            case 'top':{
                const height = this.getPropertyValue('height');
                pos = Math.min(height * pos, height);
                this.cursor.css('bottom', `${pos}px`);
                break;
            }

            default:{
                const width = this.getPropertyValue('width');
                pos = Math.min(width * pos, width);
                this.cursor.css('left', `${pos}px`);
            }
        }
    }

}
