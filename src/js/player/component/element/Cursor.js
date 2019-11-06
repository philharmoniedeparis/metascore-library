import Element from '../Element';
import Dom from '../../../core/Dom';
import {MasterClock} from '../../../core/media/Clock';
import {map, radians} from '../../../core/utils/Math';
import {isEmpty} from '../../../core/utils/Var';

/**
 * A cursor element
 *
 * @emits {time} Fired when a cursor is clicked, requesting a time update
 * @param {Object} element The element instance
 * @param {Number} time The time value according to the click position
 * @param {Number} position The click position relative to the component
 */
export default class Cursor extends Element {

    /**
     * @inheritdoc
    */
    static getType(){
        return 'Cursor';
    }

    /**
     * @inheritdoc
    */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'properties': Object.assign({}, defaults.properties, {
                'border-radius': {
                    'type': 'string',
                    'applies': function(){
                        return this.getPropertyValue('form') !== 'circular';
                    }
                },
                'form': {
                    'type': 'string',
                    'default': 'linear'
                },
                'keyframes': {
                    'type': 'array',
                    'applies': function(){
                        return this.getPropertyValue('form') === 'linear';
                    }
                },
                'direction': {
                    'type': 'string',
                    'default': 'right'
                },
                'start-angle': {
                    'type': 'number',
                    'default': 0,
                    'applies': function(){
                        return this.getPropertyValue('form') === 'circular';
                    }
                },
                'loop-duration': {
                    'type': 'time',
                    'applies': function(){
                        return this.getPropertyValue('form') === 'circular';
                    }
                },
                'acceleration': {
                    'type': 'number',
                    'default': 1,
                    'applies': function(){
                        return this.getPropertyValue('form') === 'linear' && isEmpty(this.getPropertyValue('keyframes'));
                    }
                },
                'cursor-width': {
                    'type': 'number',
                    'default': 1
                },
                'cursor-color': {
                    'type': 'color',
                    'default': '#000000'
                }
            })
        });
    }

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this
            .addListener('activate', this.onActivate.bind(this))
            .addListener('resizeend', this.onResizeEnd.bind(this))
            .addListener('click', this.onClick.bind(this));
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

        return this;
    }

    /**
     * @inheritdoc
     */
    updatePropertyValue(property, value){
        switch(property){
            case 'form':
                this.data('form', value);
                break;

            case 'direction':
            case 'acceleration': {
                    const cuepoint = this.getCuePoint();
                    if(cuepoint){
                        cuepoint.update();
                    }
                }
                break;

            case 'width':
            case 'height':
            case 'border-width':
                super.updatePropertyValue(property, value);
                this.resizeCanvas();
                break;

            default:
                super.updatePropertyValue(property, value);
        }

        this.draw();
    }

    /**
     * The activate event handler
     *
     * @private
     */
    onActivate(){
        this.resizeCanvas();
        this.draw();
    }

    /**
     * The resizeend event handler
     *
     * @private
     */
    onResizeEnd(){
        this.resizeCanvas();
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
            case 'circular': {
                const angle = this.getCircularAngleFromMouse(evt);
                const time = this.getTimeFromCircularAngle(angle);
                this.triggerEvent('time', {'element': this, 'time': time});
                break;
            }

            default: {
                const pos = this.getLinearPositionFromMouse(evt);
                const time = this.getTimeFromLinearPosition(pos.x, pos.y);
                this.triggerEvent('time', {'element': this, 'time': time});
                break;
            }
        }
    }

    /**
     * @inheritdoc
     */
    onCuePointUpdate(evt){
        super.onCuePointUpdate(evt);

        this.draw();
    }

    /**
     * Readjust the canvas's size
     *
     * @private
     * @return {this}
     */
    resizeCanvas(){
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        return this;
    }

    /**
     * Update the <canvas> size
     *
     * @return {this}
     */
    draw(){
        if(this.isActive()){
            // Clear the canvas.
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const form = this.getPropertyValue('form');
            switch(form){
                case 'circular':
                    this.drawCircularCursor();
                    break;

                default:
                    this.drawLinearCursor();
                    break;
            }
        }

        return this;
    }

    /**
     * Draw a linear cursor
     *
     * @return {this}
     */
    drawLinearCursor(){
        const direction = this.getPropertyValue('direction');
        const cursor_width = this.getPropertyValue('cursor-width');
        const cursor_color = this.getPropertyValue('cursor-color');
        const current_time = MasterClock.getTime();

        const pos = this.getLinearPositionFromTime(current_time);
        const vertical = direction === 'bottom' || direction === 'top';
        const width = vertical ? this.canvas.width : cursor_width;
        const height = vertical ? cursor_width : this.canvas.height;

        switch(direction){
            case 'top':
                pos.y -= cursor_width;
                break;

            case 'left':
                pos.x -= cursor_width;
                break;
        }

        // Draw the cursor line.
        this.context.save();
        this.context.beginPath();
        this.context.rect(pos.x, pos.y, width, height);
        this.context.fillStyle = cursor_color;
        this.context.fill();
        this.context.closePath();
        this.context.restore();

        return this;
    }

    /**
     * Helper function to get a position on a linear cursor corresponding to a mouse position
     *
     * @private
     * @param {Event} evt The mouse click event
     * @returns {Object} The x and y position
     */
    getLinearPositionFromMouse(evt){
        const rect = this.canvas.getBoundingClientRect();

        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    /**
     * Helper function to get a position on a linear cursor corresponding to a media time
     *
     * @private
     * @param {Number} time The media time in centiseconds
     * @returns {Object} The x and y position
     */
    getLinearPositionFromTime(time){
        const direction = this.getPropertyValue('direction');
        const reversed = direction === 'left' || direction === 'top';
        let start_time = this.getPropertyValue('start-time');
        let end_time = this.getPropertyValue('end-time');

        let start_position = 0;
        let end_position = direction === 'top' || direction === 'bottom' ? this.canvas.height : this.canvas.width;
        let acceleration = 1;
        const pos = {'x': 0, 'y': 0};

        if(reversed){
            start_position = end_position;
            end_position = 0;
        }

        const keyframes = this.getPropertyValue('keyframes');
        if(keyframes){
            // Calculate position from keyframes
            keyframes.forEach((keyframe) => {
                if(reversed){
                    if(keyframe.time <= time && keyframe.position <= start_position){
                        start_position = keyframe.position;
                        start_time = keyframe.time;
                    }

                    if(keyframe.time >= time && keyframe.position >= end_position){
                        end_position = keyframe.position;
                        end_time = keyframe.time;
                    }
                }
                else{
                    if(keyframe.time <= time && keyframe.position >= start_position){
                        start_position = keyframe.position;
                        start_time = keyframe.time;
                    }

                    if(keyframe.time >= time && keyframe.position <= end_position){
                        end_position = keyframe.position;
                        end_time = keyframe.time;
                    }
                }
            });
        }
        else{
            // Calculate position from acceleration
            acceleration = this.getPropertyValue('acceleration');
        }

        // Calculate position
        switch(direction){
            case 'top':
            case 'bottom':
                pos.y = map(time, start_time, end_time, start_position, end_position);
                pos.y = Math.pow(pos.y, acceleration);
                pos.y = Math.round(pos.y);
                break;

            case 'left':
            default:
                pos.x = map(time, start_time, end_time, start_position, end_position);
                pos.x = Math.pow(pos.x, acceleration);
                pos.x = Math.round(pos.x);
        }

        return pos;
    }

    /**
     * Helper function to get the media time corresponding to a position on the cursor
     *
     * @private
     * @param {Number} x The position on the horizontal axis
     * @param {Number} y The position on the vertical axis
     * @returns {Number} The corresponding media time
     */
    getTimeFromLinearPosition(x, y){
        const direction = this.getPropertyValue('direction');
        const axis = direction === 'top' || direction === 'bottom' ? 'y' : 'x';
        const reversed = direction === 'left' || direction === 'top';
        let start_time = this.getPropertyValue('start-time');
        let end_time = this.getPropertyValue('end-time');

        let start_position = 0;
        let end_position = axis === 'y' ? this.canvas.height : this.canvas.width;
        let pos = axis === 'y' ? y : x;

        if(reversed){
            start_position = end_position;
            end_position = 0;
        }

        const keyframes = this.getPropertyValue('keyframes');
        if(keyframes){
            // Calculate position from keyframes
            keyframes.forEach((keyframe) => {
                if(reversed){
                    if(keyframe.position <= pos && keyframe.time <= start_time){
                        start_position = keyframe.position;
                        start_time = keyframe.time;
                    }

                    if(keyframe.position >= pos && keyframe.time >= end_time){
                        end_position = keyframe.position;
                        end_time = keyframe.time;
                    }
                }
                else{
                    if(keyframe.position <= pos && keyframe.time >= start_time){
                        start_position = keyframe.position;
                        start_time = keyframe.time;
                    }

                    if(keyframe.position >= pos && keyframe.time <= end_time){
                        end_position = keyframe.position;
                        end_time = keyframe.time;
                    }
                }
            });
        }
        else{
            // Calculate position from acceleration
            const acceleration = this.getPropertyValue('acceleration');
            pos = Math.pow(pos, 1/acceleration);
        }

        return map(pos, start_position, end_position, start_time, end_time);
    }

    /**
     * Draw a circular cursor
     *
     * @return {this}
     */
    drawCircularCursor(){
        const width = this.canvas.width;
        const height = this.canvas.height;
        const current_time = MasterClock.getTime();

        const border_width = this.getPropertyValue('border-width');
        const cursor_width = this.getPropertyValue('cursor-width');
        const cursor_color = this.getPropertyValue('cursor-color');

        const angle = this.getCircularAngleFromTime(current_time);

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
        this.context.translate(0.5, 0.5); // Translate by 0.5 px in both direction for anti-aliasing
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
     * Helper function to get an angle on a circular cursor corresponding to a mouse position
     *
     * @private
     * @param {Event} evt The mouse click event
     * @returns {Number} The angle in radians
     */
    getCircularAngleFromMouse(evt){
        const pos = this.getLinearPositionFromMouse(evt);
        const direction = this.getPropertyValue('direction');

        let x = pos.x;
        x -= this.canvas.width/2;
        x *= direction === 'ccw' ? -1 : 1;

        let y = pos.y;
        y -= this.canvas.height/2;

        return Math.atan2(y, x) + Math.PI;
    }

    /**
     * Helper function to get an angle on a circular cursor corresponding to a media time
     *
     * @private
     * @param {Number} time The media time in centiseconds
     * @returns {Number} The angle in radians
     */
    getCircularAngleFromTime(time){
        const start_time = this.getPropertyValue('start-time');
        const end_time = this.getPropertyValue('end-time');
        const direction = this.getPropertyValue('direction');
        const start_angle = radians(this.getPropertyValue('start-angle'));
        const loop_duration = this.getPropertyValue('loop-duration') || end_time - start_time;

        let angle = start_angle;
        angle += Math.PI / 2; // Adjust the angle so that 0 start at top
        angle += map(time - start_time, 0, loop_duration, 0, Math.PI * 2) * (direction === 'ccw' ? -1 : 1);

        return angle;
    }

    /**
     * Helper function to get the media time corresponding to an angle in a circular cursor
     *
     * @private
     * @param {Number} a The angle in radians
     * @returns {Number} The corresponding media time
     */
    getTimeFromCircularAngle(a){
        const start_time = this.getPropertyValue('start-time');
        const end_time = this.getPropertyValue('end-time');
        const start_angle = radians(this.getPropertyValue('start-angle'));
        const loop_duration = this.getPropertyValue('loop-duration') || end_time - start_time;
        const current_time = MasterClock.getTime();

        let angle = a;
        angle -= Math.PI / 2; // Adjust the angle so that 0 start at top
        angle -= start_angle;

        let time = map(angle, 0, Math.PI * 2, 0, loop_duration);
        time += start_time;

        const current_loop = Math.floor((current_time - start_time) / loop_duration);
        time += loop_duration * current_loop;

        return time;
    }

}
