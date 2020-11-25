import Dom from '../../core/Dom';
import TimeInput from '../../core/ui/input/TimeInput';
import {clamp} from '../../core/utils/Math';
import {clone} from '../../core/utils/Array';
import ContextMenu from '../../core/ui/ContextMenu';
import Locale from '../../core/Locale';
import {MasterClock} from '../../core/media/MediaClock';

/**
 * A helper class to manage a cursor component's keyframes
 * @todo: move some code to a Keyframe subclass
 */
export default class CursorKeyframesEditor extends Dom {

    static defaults = {
        'defaultCursorColor': '#00F',
        'hoverCursorColor': '#FF3100',
        'labelFontSize': 10,
        'labelFontFamily': 'Arial',
        'labelColor': '#FFF',
        'labelPadding': 2,
        'mouseoverDistance': 1,
        'contextmenuContainer': 'body'
    };

    /**
     * Instantiate
     *
     * @param {Component} component The cursor component
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(component, configs) {
        super('<canvas/>', {'class': 'keyframes-editor'});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.defaults, configs);

        this.component = component;

        this.keyframes = this.component.getPropertyValue('keyframes') || [];
        this.labels = {};
        this.over_keyframe = null;

        this.canvas = this.get(0);
        this.context = this.canvas.getContext('2d');

        // fix event handlers scope
        this.onComponentPropChange = this.onComponentPropChange.bind(this);
        this.onComponentResizeEnd = this.onComponentResizeEnd.bind(this);
        this.onMousemove = this.onMousemove.bind(this);
        this.onDocMousemove = this.onDocMousemove.bind(this);
        this.onDocMouseup = this.onDocMouseup.bind(this);
        this.onDocClick = this.onDocClick.bind(this);
        this.onMediaClockTimeupdate = this.onMediaClockTimeupdate.bind(this);

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

        const component_el = this.component.get(0);
        const component_dom = new Dom(component_el);

        this.doc = new Dom(Dom.getElementDocument(component_el));

        this
            .addListener('mouseover', this.onMouseover.bind(this))
            .addListener('mousedown', this.onMousedown.bind(this))
            .addListener('mouseout', this.onMouseout.bind(this))
            .addListener('click', this.onClick.bind(this))
            .appendTo(this.component.contents.get(0))
            .resizeCanvas()
            .draw();

        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        component_dom
            .addListener('propchange', this.onComponentPropChange)
            .addListener('resizeend', this.onComponentResizeEnd);

        /**
         * The context menu
         * @type {ContextMenu}
         */
        this.contextmenu = new ContextMenu({'target': component_dom, 'items': {
                'add': {
                    'text': Locale.t('editor.configseditor.CursorKeyframesEditor.contextmenu.add', 'Add a position'),
                    'callback': (context) => {
                        const mouse_position = this.getRelativeMousePosition(context.x, context.y);
                        const position = this.getKeyframePositionFromMouse(mouse_position.x, mouse_position.y);
                        const time = MasterClock.getTime();

                        this.addKeyframe(position, time);
                    },
                    'toggler': (context) => {
                        return context.el.data('state') === 'add';
                    }
                },
                'delete': {
                    'text': Locale.t('editor.configseditor.CursorKeyframesEditor.contextmenu.delete', 'Delete position'),
                    'callback': () => {
                        // Check if there is a keyframe at that position.
                        const found = this.keyframes.findIndex((keyframe) => {
                            return keyframe === this.over_keyframe;
                        });

                        if(found > -1){
                            this.removeKeyframe(found);
                        }
                    },
                    'toggler': (context) => {
                        const state = context.el.data('state');
                        return state === 'over' || state === 'overlabel';
                    }
                }
            }})
            .appendTo(this.configs.contextmenuContainer);
    }

    /**
     * The component's propchange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentPropChange(evt){
        if(evt.target !== evt.currentTarget){
            // Caught a bubbled event, skip
            return;
        }

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
        this.mouse_position = this.getRelativeMousePosition(evt.clientX, evt.clientY);

        this.addListener('mousemove', this.onMousemove);
        MasterClock.addListener('timeupdate', this.onMediaClockTimeupdate);

        if(!this.dragging){
            this.updateState();
        }
    }

    /**
     * The mousemove event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onMousemove(evt){
        if(!this.dragging){
            this.mouse_position = this.getRelativeMousePosition(evt.clientX, evt.clientY);
            this.updateState();
        }
    }

    /**
     * The mousedown event handler
     *
     * @private
     */
    onMousedown(){
        if(this.data('state') !== 'over'){
            return;
        }

        // Check if there is a keyframe at that position.
        this.dragging = this.keyframes.find((keyframe) => {
            return keyframe === this.over_keyframe;
        });

        if(this.dragging){
            const width = this.canvas.width;
            const height = this.canvas.height;
            const direction = this.component.getPropertyValue('direction');
            const vertical = direction === 'top' || direction === 'bottom';

            let min = 0;
            let max = vertical ? height : width;

            // Calculate the drag limits
            this.keyframes.forEach((keyframe) => {
                if(keyframe !== this.dragging){
                    if(keyframe.position < this.dragging.position){
                        min = Math.max(min, keyframe.position + 1);
                    }
                    else if(keyframe.position > this.dragging.position){
                        max = Math.min(max, keyframe.position - 1);
                    }
                }
            });

            this._drag_limits = {
                'min': min,
                'max': max
            };

            this.doc
                .addListener('mousemove', this.onDocMousemove)
                .addListener('mouseup', this.onDocMouseup);
        }
    }

    /**
     * The mouseout event handler
     *
     * @private
     */
    onMouseout(){
        this.removeListener('mousemove', this.onMousemove);
        MasterClock.removeListener('timeupdate', this.onMediaClockTimeupdate);

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
        switch(this.data('state')){
            case 'add': {
                    const mouse_position = this.getRelativeMousePosition(evt.clientX, evt.clientY);
                    const position = this.getKeyframePositionFromMouse(mouse_position.x, mouse_position.y);
                    const time = MasterClock.getTime();

                    this.addKeyframe(position, time);
                }
                break;

            case 'overlabel': {
                    const found = this.keyframes.find((keyframe) => {
                        return keyframe === this.over_keyframe;
                    });
                    if(found){
                        MasterClock.setTime(found.time);
                    }
                }
                break;
        }

        evt.stopPropagation();
    }

    /**
     * The media's timeupdate event handler
     *
     * @private
     */
    onMediaClockTimeupdate(){
        if(!this.dragging){
            this.updateState();
        }
    }

    /**
     * The document mousemove event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onDocMousemove(evt){
        const mouse_position = this.getRelativeMousePosition(evt.clientX, evt.clientY);
        let position = this.getKeyframePositionFromMouse(mouse_position.x, mouse_position.y);

        // Clamp the position
        position = clamp(position, this._drag_limits.min, this._drag_limits.max);

        if(this.dragging.position !== position){
            this.dragging.position = position;

            this.draw();
        }

        this._dragged = true;

        evt.stopPropagation();
    }

    /**
     * The document mouseup event handler
     *
     * @private
     */
    onDocMouseup(){
        this.doc
            .removeListener('mousemove', this.onDocMousemove)
            .removeListener('mouseup', this.onDocMouseup);

        // if a drag did occur, prevent the next click event from propagating
        if(this._dragged){
            this.doc.addOneTimeListener('click', this.onDocClick, true);
        }

        delete this.dragging;
        delete this._drag_limits;
        delete this._dragged;
    }

    /**
     * The document click event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onDocClick(evt){
        this.updateState();

        evt.stopPropagation();
        evt.preventDefault();
    }

    /**
     * Add a keyframe
     *
     * @private
     * @param {Number} position The keyframe's position
     * @param {Number} time The keyframe's time
     * @returns {this}
     */
    addKeyframe(position, time){
        this.keyframes.push({
            'time': time,
            'position': position
        });

        this.keyframes = this.keyframes.sort((a, b) => {
            return a.position - b.position;
        });

        this.component.setPropertyValue('keyframes', clone(this.keyframes));

        this.draw();

        return this;
    }

    /**
     * Remove a keyframe
     *
     * @private
     * @param {Number} index The keyframe's index
     * @returns {this}
     */
    removeKeyframe(index){
        const keyframe = this.keyframes[index];

        this.keyframes.splice(index, 1);

        if(keyframe){
            delete this.labels[keyframe.position];

            if(this.over_keyframe === keyframe){
                delete this.over_keyframe;
            }
        }

        this.component.setPropertyValue('keyframes', this.keyframes.length === 0 ? null : clone(this.keyframes));

        this.draw();

    }

    /**
     * Get the relative mouse position from a mouse event
     *
     * @private
     * @param {Number} x The absolute mouse x position
     * @param {Number} y The absolute mouse y position
     * @return {Object} The relative x and y positions
     */
    getRelativeMousePosition(x, y){
        const rect = this.canvas.getBoundingClientRect();

        return {
            x: x - rect.left,
            y: y - rect.top
        };
    }

    getKeyframePositionFromMouse(x, y){
        const direction = this.component.getPropertyValue('direction');

        switch(direction){
            case 'bottom':
            case 'top':
                return y;

            case 'left':
            default:
                return x;
        }
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
        const position = this.getKeyframePositionFromMouse(this.mouse_position.x, this.mouse_position.y);
        const direction = this.component.getPropertyValue('direction');

        this
            .data('state', 'add')
            .attr('title', null);

        delete this.over_keyframe;

        this.keyframes.some((keyframe) => {
            // Check if we are over the keyframe.
            const over = Math.abs(keyframe.position - position) <= this.configs.mouseoverDistance;
            if(over){
                this
                    .data('state', 'over')
                    .attr('title', TimeInput.getTextualValue(keyframe.time));

                this.over_keyframe = keyframe;

                return true;
            }

            // Else, check if we are over the keyframe's label.
            const label = this.labels[keyframe.position];
            const over_label = this.mouse_position.x >= label.x
                && this.mouse_position.y >= label.y
                && this.mouse_position.x <= label.x + label.width
                && this.mouse_position.y <= label.y + label.height;

            if(over_label){
                this
                    .data('state', 'overlabel')
                    .attr('title', TimeInput.getTextualValue(keyframe.time));

                this.over_keyframe = keyframe;

                return true;
            }

            return false;
        });


        // If we are neither over a keyframe nor over a label, check if a keyframe can be added.
        if(!this.over_keyframe){
            const time = MasterClock.getTime();

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

        this.draw();

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

        clone(this.keyframes)
            // Sort keyframes to make sure the one with over = true is on top
            .sort((a, b) => {
                if(a === this.over_keyframe){
                    return 1;
                }
                else if(b === this.over_keyframe){
                    return -1;
                }
                return 0;
            })
            // Draw the sorted keyframes
            .forEach((keyframe) => {
                this.drawKeyframe(keyframe);
            });

        return this;
    }

    /**
     * Draw a keyframe
     *
     * @private
     * @param {Object} keyframe The keyframe
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

        const over = this.over_keyframe === keyframe;

        // Draw the cursor line.
        this.context.save();
        this.context.translate(0.5, 0.5);
        this.context.beginPath();
        this.context.moveTo(pos_1.x, pos_1.y);
        this.context.lineTo(pos_2.x, pos_2.y);
        this.context.lineWidth = 1;
        this.context.strokeStyle = this.configs[over ? 'hoverCursorColor' : 'defaultCursorColor'];
        this.context.stroke();
        this.context.closePath();
        this.context.restore();

        // Draw the cursor label.
        const label_text = TimeInput.getTextualValue(keyframe.time);
        const label_size = this.context.measureText(label_text);
        if(!(keyframe.position in this.labels)){
            this.labels[keyframe.position] = {};
        }
        const label = this.labels[keyframe.position];
        Object.assign(label, {
            'x': pos_1.x,
            'y': pos_1.y,
            'width': label_size.width + this.configs.labelPadding * 2,
            'height': this.configs.labelFontSize + this.configs.labelPadding * 2
        });
        this.context.save();
        this.context.translate(0.5, 0.5);
        this.context.font = `${this.configs.labelFontSize}px ${this.configs.labelFontFamily}`;
        this.context.textBaseline = 'middle';
        this.context.textAlign = 'center';
        this.context.fillStyle = this.configs[over ? 'hoverCursorColor' : 'defaultCursorColor'];
        this.context.fillRect(label.x, label.y, label.width, label.height);
        this.context.fillStyle = this.configs.labelColor;
        this.context.fillText(label_text, label.x + label.width/2, label.y + label.height/2);
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

        this.contextmenu.remove();
        delete this.contextmenu;

        return super.remove();
    }

}
