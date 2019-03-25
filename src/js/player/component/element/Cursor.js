import Element from '../Element';
import Dom from '../../../core/Dom';
import Locale from '../../../core/Locale';
import {toCSS} from '../../../core/utils/Color';
import {map} from '../../../core/utils/Math';

/**
 * A cursor element
 *
 * @emits {time} Fired when a cursor is clicked, requesting a time update
 * @param {Object} element The element instance
 * @param {Number} time The time value according to the click position
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
                        this.data('direction', value);
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
                    'getter': function(){
                        const value = parseInt(this.data('cursor-width'), 10);
                        return isNaN(value) ? 1 : value;
                    },
                    'setter': function(value){
                        this.data('cursor-width', value);
                    }
                },
                'cursor-color': {
                    'type': 'Color',
                    'configs': {
                        'label': Locale.t('player.component.element.Cursor.cursor-color', 'Cursor color')
                    },
                    'getter': function(){
                        const value = this.data('cursor-color');
                        return value ? value : toCSS('#000');
                    },
                    'setter': function(value){
                        this.data('cursor-color', toCSS(value));
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

    constructor(configs) {
        super(configs);

        /**
         * The current media time
         * @type int
         */
        this.current_time = null;
    }

    /**
     * Setup the cursor's UI
     *
     * @private
     */
    setupUI(){
        // call parent function
        super.setupUI();

        /**
         * The cursor's line
         * @type {Dom}
         */
        this.cursor = new Dom('<canvas/>', {'class': 'cursor'})
            .appendTo(this.contents);

        this.canvas = this.cursor.get(0);
        this.context = this.canvas.getContext('2d');

        this
            .addListener('propchange', this.onPropChange.bind(this))
            .addListener('click', this.onClick.bind(this));

        return this;
    }

    /**
     * The propchange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onPropChange(){
        this.draw();
    }

    /**
     * The click event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onClick(evt){
        const rect = this.get(0).getBoundingClientRect();
        const time = this.getTimeFromPosition(evt.clientX - rect.left, evt.clientY - rect.top);

        this.triggerEvent('time', {'element': this, 'value': time});
    }

    /**
     * The cuepoint update event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onCuePointUpdate(evt){
        this.current_time = evt.target.getMedia().getTime();

        this.draw();
    }

    /**
     * Update the <canvas> size
     *
     * @return {this}
     */
    draw(){
        const width = this.contents.get(0).clientWidth;
        const height = this.contents.get(0).clientHeight;

        const direction = this.getPropertyValue('direction');
        const cursor_width = this.getPropertyValue('cursor-width');
        const cursor_color = this.getPropertyValue('cursor-color');

        const pos = this.getPositionFromTime(this.current_time);

        let w = width;
        let h = height;

        switch(direction){
            case 'bottom':
            case 'top':
                h = cursor_width;
                break;

            case 'left':
            default:
                w = cursor_width;
        }

        // Resize the canvas.
        this.canvas.width = width;
        this.canvas.height = height;

        // Clear the canvas.
        this.context.clearRect(0, 0, width, height);

        // Draw the cursor line.
        this.context.fillStyle = cursor_color;
        this.context.fillRect(pos.x, pos.y, w, h);

        return this;
    }

    /**
     * Helper function to get a position on the cursor corresponding to a media time
     *
     * @private
     */
    getPositionFromTime(time){
        const width = this.contents.get(0).clientWidth;
        const height = this.contents.get(0).clientHeight;

        const start_time = this.getPropertyValue('start-time');
        const end_time = this.getPropertyValue('end-time');
        const direction = this.getPropertyValue('direction');
        const acceleration = this.getPropertyValue('acceleration');

        const pos = {
            x: 0,
            y: 0
        };

        switch(direction){
            case 'top':{
                pos.y = map(time, start_time, end_time, 0, height);
                pos.y = height - Math.pow(pos.y, acceleration);
                pos.y = Math.round(pos.y);
                break;
            }

            case 'bottom':{
                pos.y = map(time, start_time, end_time, 0, height);
                pos.y = Math.pow(pos.y, acceleration);
                pos.y = Math.round(pos.y);
                break;
            }

            case 'left':{
                pos.x = map(time, start_time, end_time, 0, width);
                pos.x = width - Math.pow(pos.x, acceleration);
                pos.x = Math.round(pos.x);
                break;
            }

            default:{
                pos.x = map(time, start_time, end_time, 0, width);
                pos.x = Math.pow(pos.x, acceleration);
                pos.x = Math.round(pos.x);
            }
        }

        return pos;
    }

    /**
     * Helper function to get the media time corresponding to a position on the cursor
     *
     * @private
     */
    getTimeFromPosition(x, y){
        const width = this.contents.get(0).clientWidth;
        const height = this.contents.get(0).clientHeight;

        const start_time = this.getPropertyValue('start-time');
        const end_time = this.getPropertyValue('end-time');
        const direction = this.getPropertyValue('direction');
        const acceleration = this.getPropertyValue('acceleration');

        let value = 0;

        switch(direction){
            case 'top':
                value = Math.pow(height - y, 1/acceleration);
                return map(value, 0, height, start_time, end_time);

            case 'bottom':
                value = Math.pow(y, 1/acceleration);
                return map(value, 0, height, start_time, end_time);

            case 'left':
                value = Math.pow(width - x, 1/acceleration);
                return map(value, 0, width, start_time, end_time);

            default:
                value = Math.pow(x, 1/acceleration);
                return map(value, 0, width, start_time, end_time);
        }
    }

}
