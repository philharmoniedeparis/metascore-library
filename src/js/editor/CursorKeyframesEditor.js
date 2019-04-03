import Dom from '../core/Dom';
import TimeField from '../editor/field/Time';
import {isEmpty} from '../core/utils/Var';

/**
 * A helper class to manage a cursor component's keyframes
 */
export default class CursorKeyframesEditor extends Dom {

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'defaultCursorColor': '#00F',
            'hoverCursorColor': '#FF3100',
            'labelFontSize': 10,
            'labelFontFamily': 'Arial',
            'labelColor': '#FFF',
            'labelPadding': 2,
            'mouseoverDistance': 1
        };
    }

    /**
     * Instantiate
     *
     * @param {Component} component The cursor component
     * @param {Media} media The player's media
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(component, media, configs) {
        super('<canvas/>', {'class': 'keyframes-editor'});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.component = component;
        this.media = media;

        this.canvas = this.get(0);
        this.context = this.canvas.getContext('2d');

        this.mouse_position = null;

        // fix event handlers scope
        this.onComponentPropChange = this.onComponentPropChange.bind(this);
        this.onComponentResizeEnd = this.onComponentResizeEnd.bind(this);
        this.onMousemove = this.onMousemove.bind(this);
        this.onMediaTimeupdate = this.onMediaTimeupdate.bind(this);

        // Disable the draggable behaviour
        const draggable = this.component.getDraggable();
        if(draggable){
            draggable.disable();
        }
        // Disable the resizable behaviour
        const resizable = this.component.getResizable();
        if(resizable){
            resizable.disable();
        }

        this
            .initKeyframes()
            .addListener('mouseover', this.onMouseover.bind(this))
            .addListener('mouseout', this.onMouseout.bind(this))
            .addListener('click', this.onClick.bind(this))
            .appendTo(this.component.contents.get(0))
            .resizeCanvas()
            .draw();

        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        new Dom(this.component.get(0))
            .addListener('propchange', this.onComponentPropChange)
            .addListener('resizeend', this.onComponentResizeEnd);
    }

    /**
     * The component's propchange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentPropChange(evt){
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
     * The component's resizeend event handler
     *
     * @private
     */
    onComponentResizeEnd(){
        this.resizeCanvas();
        this.draw();
    }

    /**
     * The mouseover event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onMouseover(evt){
        this.mouse_position = this.getMousePosition(evt);

        this.addListener('mousemove', this.onMousemove);
        this.media.addListener('timeupdate', this.onMediaTimeupdate);

        this.updateState();
    }

    /**
     * The mousemove event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onMousemove(evt){
        this.mouse_position = this.getMousePosition(evt);

        this.updateState();
    }

    /**
     * The mouseout event handler
     *
     * @private
     */
    onMouseout(){
        this.removeListener('mousemove', this.onMousemove);
        this.media.removeListener('timeupdate', this.onMediaTimeupdate);

        delete this.mouse_position;

        this.draw();
    }

    /**
     * The click event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onClick(evt){
        evt.stopPropagation();

        if(this.data('state') === 'invalid'){
            return;
        }

        // Check if there is a keyframe at that position.
        const found = this.keyframes.findIndex((keyframe) => {
            return keyframe.mouseover;
        });

        if(found > -1){
            this.keyframes.splice(found, 1);
        }
        else{
            const position = this.getMousePosition(evt);
            const time = this.media.getTime();

            this.keyframes.push({
                'time': parseInt(time, 10),
                'position': parseInt(position, 10),
                'mouseover': false
            });
        }

        this
            .updateComponentKeyframes()
            .draw();
    }

    /**
     * The media's timeupdate event handler
     *
     * @private
     */
    onMediaTimeupdate(){
        this.updateState();
    }

    /**
     * Initialize the keyframes variable from the component's keyframes property
     *
     * @private
     * @return {this}
     */
    initKeyframes(){
        const value = this.component.getPropertyValue('keyframes');

        this.keyframes = [];

        if(!isEmpty(value)){
            value.split(',').forEach((keyframe) => {
                const [position, time] = keyframe.split('|');

                this.keyframes.push({
                    'time': parseInt(time, 10),
                    'position': parseInt(position, 10),
                    'mouseover': false
                });
            });
        }

        return this;
    }

    /**
     * Get the mouse position from a mouse event
     *
     * @private
     * @param {MouseEvent} evt The mouse event
     * @return {Number} The corresponding position
     */
    getMousePosition(evt){
        const direction = this.component.getPropertyValue('direction');
        const rect = this.canvas.getBoundingClientRect();

        switch(direction){
            case 'bottom':
            case 'top':
                return evt.clientY - rect.top;

            case 'left':
            default:
                return evt.clientX - rect.left;
        }
    }

    /**
     * Update the component's keyframes propoerty
     *
     * @private
     * @return {this}
     */
    updateComponentKeyframes(){
        if(this.keyframes.length === 0){
            this.component.setPropertyValue('keyframes', null);
        }
        else{
            const value = [];
            this.keyframes.forEach((keyframe) => {
                value.push(`${keyframe.position}|${keyframe.time}`);
            });
            this.component.setPropertyValue('keyframes', value.join(','));
        }

        return this;
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
     * Update the editor's state depending on the mouse position
     *
     * @private
     * @return {this}
     */
    updateState(){
        const position = this.mouse_position;
        const direction = this.component.getPropertyValue('direction');

        this
            .data('state', null)
            .attr('title', null);

        let needs_redraw = false;
        let is_over_keyframe = false;
        this.keyframes.forEach((keyframe) => {
            const over = Math.abs(keyframe.position - position) <= this.configs.mouseoverDistance;

            if(over){
                this
                    .data('state', 'remove')
                    .attr('title', TimeField.getTextualValue(keyframe.time));
            }

            if(keyframe.mouseover !== over){
                needs_redraw = true;
            }

            is_over_keyframe = is_over_keyframe || over;
            keyframe.mouseover = over;
        });

        if(!is_over_keyframe){
            const time = this.media.getTime();

            // Check if a cursor can be added at that position and time.
            const invalid = this.keyframes.some((keyframe) => {
                switch(direction){
                    case 'top':
                    case 'left':
                        return (position > keyframe.position && time > keyframe.time) || (position < keyframe.position && time < keyframe.time);

                    default:
                        return (position < keyframe.position && time > keyframe.time) || (position > keyframe.position && time < keyframe.time);
                }
            });

            if(invalid){
                this.data('state', 'invalid');
            }
        }

        if(needs_redraw){
            this.draw();
        }

        return this;
    }

    /**
     * Draw the keyframes
     *
     * @private
     * @return {this}
     */
    draw(){
        // Clear the canvas.
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.keyframes.forEach((keyframe) => {
            this.drawKeyframe(keyframe);
        });

        return this;
    }

    /**
     * Draw a keyframe
     *
     * @private
     * @param {Number} position The keyframe's position
     * @return {this}
     */
    drawKeyframe(keyframe){
        const width = this.canvas.width;
        const height = this.canvas.height;

        const direction = this.component.getPropertyValue('direction');
        const pos_1 = {
            x: 0,
            y: 0
        };

        switch(direction){
            case 'bottom':
            case 'top':
                pos_1.y = keyframe.position;
                break;

            case 'left':
            default:
                pos_1.x = keyframe.position;
        }

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
        this.context.lineWidth = 1;
        this.context.strokeStyle = this.configs[keyframe.mouseover ? 'hoverCursorColor' : 'defaultCursorColor'];
        this.context.stroke();
        this.context.closePath();
        this.context.restore();

        // Draw the cursor label.
        const label_text = TimeField.getTextualValue(keyframe.time);
        this.context.save();
        this.context.translate(0.5, 0.5);
        this.context.font = `${this.configs.labelFontSize}px ${this.configs.labelFontFamily}`;
        const label_size = this.context.measureText(label_text);
        this.context.textBaseline = 'top';
        this.context.fillStyle = this.configs[keyframe.mouseover ? 'hoverCursorColor' : 'defaultCursorColor'];
        this.context.fillRect(pos_1.x, pos_1.y, label_size.width + this.configs.labelPadding, this.configs.labelFontSize + this.configs.labelPadding);
        this.context.fillStyle = this.configs.labelColor;
        this.context.fillText(label_text, pos_1.x + this.configs.labelPadding/2, pos_1.y + this.configs.labelPadding/2);
        this.context.restore();

        return this;
    }

    /**
     * @inheritdoc
     */
    remove() {
        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        new Dom(this.component.get(0))
            .removeListener('propchange', this.onComponentPropChange)
            .removeListener('resizeend', this.onComponentResizeEnd);

        // Re-enable the draggable behaviour
        const draggable = this.component.getDraggable();
        if(draggable){
            draggable.enable();
        }
        // Re-enable the resizable behaviour
        const resizable = this.component.getResizable();
        if(resizable){
            resizable.enable();
        }

        return super.remove();
    }

}
