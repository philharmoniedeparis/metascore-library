import Element from '../Element';
import Dom from '../../../core/Dom';
import Locale from '../../../core/Locale';
import {toCSS} from '../../../core/utils/Color';
import {map, radians} from '../../../core/utils/Math';

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
                'border-radius': {
                    'type': 'BorderRadius',
                    'configs': {
                        'label': Locale.t('player.component.Element.border-radius', 'Border radius')
                    },
                    'getter': function(skipDefault){
                        return this.contents.css('border-radius', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.contents.css('border-radius', value);
                    },
                    'applies': function(){
                        return this.getPropertyValue('form') !== 'circular';
                    }
                },
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
                'form': {
                    'type': 'Select',
                    'configs': {
                        'label': Locale.t('player.component.element.Cursor.form', 'Form'),
                        'options': [
                            {
                                'value': 'linear',
                                'text': Locale.t('player.component.element.Cursor.form.linear', 'Linear')
                            },
                            {
                                'value': 'circular',
                                'text': Locale.t('player.component.element.Cursor.form.circular', 'Circular')
                            }
                        ]
                    },
                    'getter': function(){
                        const value = this.data('form');
                        return value ? value : 'linear';
                    },
                    'setter': function(value){
                        this.data('form', value);
                    }
                },
                'mode': {
                    'type': 'Select',
                    'configs': {
                        'label': Locale.t('player.component.element.Cursor.mode', 'Mode'),
                        'options': [
                            {
                                'value': 'simple',
                                'text': Locale.t('player.component.element.Cursor.mode.simple', 'Simple')
                            },
                            {
                                'value': 'advanced',
                                'text': Locale.t('player.component.element.Cursor.mode.advanced', 'Advanced')
                            }
                        ]
                    },
                    'getter': function(){
                        const value = this.data('mode');
                        return value ? value : 'simple';
                    },
                    'setter': function(value){
                        this.data('mode', value);
                    },
                    'applies': function(){
                        return this.getPropertyValue('form') === 'linear';
                    }
                },
                'direction': {
                    'type': 'Select',
                    'configs': {
                        'label': Locale.t('player.component.element.Cursor.direction', 'Direction'),
                        'options': [
                            {
                                'value': 'right',
                                'text': Locale.t('player.component.element.Cursor.direction.right', 'Left > Right'),
                                'applies': function(){
                                    return this.getPropertyValue('form') !== 'circular';
                                }
                            },
                            {
                                'value': 'left',
                                'text': Locale.t('player.component.element.Cursor.direction.left', 'Right > Left'),
                                'applies': function(){
                                    return this.getPropertyValue('form') !== 'circular';
                                }
                            },
                            {
                                'value': 'bottom',
                                'text': Locale.t('player.component.element.Cursor.direction.bottom', 'Top > Bottom'),
                                'applies': function(){
                                    return this.getPropertyValue('form') !== 'circular';
                                }
                            },
                            {
                                'value': 'top',
                                'text': Locale.t('player.component.element.Cursor.direction.top', 'Bottom > Top'),
                                'applies': function(){
                                    return this.getPropertyValue('form') !== 'circular';
                                }
                            },
                            {
                                'value': 'cw',
                                'text': Locale.t('player.component.element.Cursor.direction.cw', 'Clockwise'),
                                'applies': function(){
                                    return this.getPropertyValue('form') === 'circular';
                                }
                            },
                            {
                                'value': 'ccw',
                                'text': Locale.t('player.component.element.Cursor.direction.ccw', 'Counterclockwise'),
                                'applies': function(){
                                    return this.getPropertyValue('form') === 'circular';
                                }
                            }
                        ]
                    },
                    'getter': function(){
                        const value = this.data('direction');
                        const form = this.data('form');
                        return value ? value : (form === 'circular' ? 'cw' : 'right');
                    },
                    'setter': function(value){
                        this.data('direction', value);
                    }
                },
                'start-angle': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.element.Cursor.start-angle', 'Start angle'),
                        'min': 0,
                        'max': 360
                    },
                    'getter': function(){
                        const value = parseInt(this.data('start-angle'), 10);
                        return isNaN(value) ? 0 : value;
                    },
                    'setter': function(value){
                        this.data('start-angle', value);
                    },
                    'applies': function(){
                        return this.getPropertyValue('form') === 'circular';
                    }
                },
                'loop-duration': {
                    'type': 'Time',
                    'configs': {
                        'label': Locale.t('player.component.element.Cursor.loop-duration', 'Loop duration'),
                        'clearButton': true
                    },
                    'getter': function(){
                        const value = parseFloat(this.data('loop-duration'));
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.data('loop-duration', isNaN(value) ? null : value);
                    },
                    'applies': function(){
                        return this.getPropertyValue('form') === 'circular';
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
    onPropChange(evt){

        switch(evt.detail.property){
            case 'width':
            case 'height':
            case 'border-width':
                this.resizeCanvas();
                break;
        }

        this.draw();
    }

    /**
     * The click event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onClick(evt){
        const form = this.getPropertyValue('form');

        switch(form){
            case 'circular':
                break;

            default: {
                const rect = this.canvas.getBoundingClientRect();
                const time = this.getTimeFromLinearPosition(evt.clientX - rect.left, evt.clientY - rect.top);

                this.triggerEvent('time', {'element': this, 'value': time});
                break;
            }
        }
    }

    /**
     * The cuepoint set event handler
     *
     * @param {Event} evt The event object
     * @private
     */
    onCuePointSet(evt){
        const cuepoint = evt.detail.cuepoint;

        cuepoint.addListener('update', this.onCuePointUpdate.bind(this));

        super.onCuePointSet(evt);
    }

    /**
     * The cuepoint update event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onCuePointStart(evt){
        super.onCuePointStart(evt);

        this.resizeCanvas();
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
     * Readjust the canvas's size
     *
     * @private
     * @return {this}
     */
    resizeCanvas(){
        const width = this.contents.get(0).clientWidth;
        const height = this.contents.get(0).clientHeight;

        // Resize the canvas.
        this.canvas.width = width;
        this.canvas.height = height;

        return this;
    }

    /**
     * Update the <canvas> size
     *
     * @return {this}
     */
    draw(){
        const form = this.getPropertyValue('form');

        if(this.canvas.width === 0 || this.canvas.height === 0){
            this.resizeCanvas();
        }

        // Clear the canvas.
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch(form){
            case 'circular':
                this.drawCircCursor();
                break;

            default:
                this.drawRectCursor();
                break;
        }

        return this;
    }

    /**
     * Draw a rectangular cursor
     *
     * @return {this}
     */
    drawRectCursor(){
        const width = this.canvas.width;
        const height = this.canvas.height;

        const direction = this.getPropertyValue('direction');
        const cursor_width = this.getPropertyValue('cursor-width');
        const cursor_color = this.getPropertyValue('cursor-color');

        const pos_1 = this.getLinearPositionFromTime(this.current_time);
        const pos_2 = {
            x: pos_1.x,
            y: pos_1.y
        };

        switch(direction){
            case 'bottom':
            case 'top':
                pos_2.x = width;
                break;

            case 'left':
            default:
                pos_2.y = height;
        }

        // Draw the cursor line.
        this.context.save();
        this.context.translate(0.5, 0.5);
        this.context.beginPath();
        this.context.moveTo(pos_1.x, pos_1.y);
        this.context.lineTo(pos_2.x, pos_2.y);
        this.context.lineWidth = cursor_width;
        this.context.strokeStyle = cursor_color;
        this.context.stroke();
        this.context.closePath();
        this.context.restore();

        return this;
    }

    /**
     * Draw a circular cursor
     *
     * @return {this}
     */
    drawCircCursor(){
        const width = this.canvas.width;
        const height = this.canvas.height;

        const border_width = this.getPropertyValue('border-width');
        const start_time = this.getPropertyValue('start-time');
        const end_time = this.getPropertyValue('end-time');
        const direction = this.getPropertyValue('direction');
        const start_angle = radians(this.getPropertyValue('start-angle'));
        const loop_duration = this.getPropertyValue('loop-duration') || end_time - start_time;
        const cursor_width = this.getPropertyValue('cursor-width');
        const cursor_color = this.getPropertyValue('cursor-color');

        let angle = start_angle;
        angle += map(this.current_time - start_time, 0, loop_duration, 0, 2 * Math.PI);
        if(direction === 'ccw'){
            angle *= -1;
        }

        const centre = {
            x: width / 2,
            y: height / 2
        };

        const point = {
            x: centre.x - ((width / 2 + border_width) * Math.cos(angle)),
            y: centre.y - ((height / 2 + border_width) * Math.sin(angle))
        };

        // Draw the cursor line.
        this.context.save();
        this.context.translate(0.5, 0.5);
        this.context.beginPath();
        this.context.moveTo(centre.x, centre.y);
        this.context.lineTo(point.x, point.y);
        this.context.lineCap = "round";
        this.context.lineWidth = cursor_width;
        this.context.strokeStyle = cursor_color;
        this.context.stroke();
        this.context.closePath();
        this.context.restore();

        return this;
    }

    /**
     * Helper function to get a position on a linear cursor corresponding to a media time
     *
     * @private
     */
    getLinearPositionFromTime(time){
        const width = this.canvas.width;
        const height = this.canvas.height;

        const start_time = this.getPropertyValue('start-time');
        const end_time = this.getPropertyValue('end-time');
        const direction = this.getPropertyValue('direction');
        const acceleration = this.getPropertyValue('acceleration');

        const pos = {
            x: 0,
            y: 0
        };

        switch(direction){
            case 'top':
                pos.y = map(time, start_time, end_time, 0, height);
                pos.y = height - Math.pow(pos.y, acceleration);
                pos.y = Math.round(pos.y);
                break;

            case 'bottom':
                pos.y = map(time, start_time, end_time, 0, height);
                pos.y = Math.pow(pos.y, acceleration);
                pos.y = Math.round(pos.y);
                break;

            case 'left':
                pos.x = map(time, start_time, end_time, 0, width);
                pos.x = width - Math.pow(pos.x, acceleration);
                pos.x = Math.round(pos.x);
                break;

            default:
                pos.x = map(time, start_time, end_time, 0, width);
                pos.x = Math.pow(pos.x, acceleration);
                pos.x = Math.round(pos.x);
        }

        return pos;
    }

    /**
     * Helper function to get the media time corresponding to a position on the cursor
     *
     * @private
     */
    getTimeFromLinearPosition(x, y){
        const width = this.canvas.width;
        const height = this.canvas.height;

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
