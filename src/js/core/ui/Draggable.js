import Dom from '../Dom';

import {bodyClassName, className, guideClassName} from '../../../css/core/ui/Draggable.scss';

/**
 * A class for adding draggable behaviors
 *
 * @emits {beforedrag} Fired before the drag starts. The event bubbles allowing the drag to be canceled by invoking preventDefault
 * @emits {dragstart} Fired when the drag started
 * @emits {drag} Fired when a drag occured
 * @emits {dragend} Fired when the drag ended
 *
 * @todo: move the position updating to this class, as is the case with the Resizable class
 */
export default class Draggable {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Dom} target The Dom object to add the behavior to
     * @property {Dom} handle The Dom object to use as a drag handle
     * @property {Boolean} [autoUpdate=true] Whether to update the size of the target automatically
     * @property {Dom} [snapGuideContainer=body] The Dom object to add snap guides to
     * @property {Number} [snapThreshold=5] The distance at which a snap guide attracts
     */
    constructor(configs) {
        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        /**
         * Snap guides
         * @type {Array}
         */
        this._snap_guides = [];

        // fix event handlers scope
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onClick = this.onClick.bind(this);

        this.enable();
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'target': null,
            'handle': null,
            'autoUpdate': true,
            'snapThreshold': 5,
            'snapGuideContainer': null,
            'snapPositions': {
                'x': [0, 0.5, 1],
                'y': [0, 0.5, 1],
            }
        };
    }

    /**
     * The mousedown event handler
     *
     * @private
     */
    onMouseDown(){
        if(!this.doc){
            /**
             * The target's owner document
             * @type {Dom}
             */
            this.doc = new Dom(Dom.getElementDocument(this.configs.target.get(0)));
        }

        this.doc
            .addListener('mousemove', this.onMouseMove)
            .addListener('mouseup', this.onMouseUp);
    }

    /**
     * The mousemove event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onMouseMove(evt){
        if(!this._dragging){
            if(!this.configs.target.triggerEvent('beforedrag', {'behavior': this}, true, true)){
                return;
            }

            /**
             * Whether the target is being dragged
             * @type {Boolean}
             */
            this._dragging = true;

            const left = parseInt(this.configs.target.css('left'), 10);
            const top = parseInt(this.configs.target.css('top'), 10);

            /**
             * State data needed during drag
             * @type {Object}
             */
            this._state = {
                'mouse': {
                    'x': evt.clientX,
                    'y': evt.clientY
                },
                'original_values': {
                    'left': left,
                    'top': top
                },
                'new_values': {
                    'left': left,
                    'top': top
                }
            };

            Dom.addClass(this.doc.get(0).body, bodyClassName);

            this.configs.target
                .addClass('dragging')
                .triggerEvent('dragstart', {'behavior': this}, false, true);

            return;
        }

        const clientX = evt.clientX;
        const clientY = evt.clientY;

        this._state.offsetX = clientX - this._state.mouse.x;
        this._state.offsetY = clientY - this._state.mouse.y;

        this._state.mouse.x = clientX;
        this._state.mouse.y = clientY;

        this.applySnap();

        // Update state values
        this._state.new_values.left += this._state.offsetX;
        this._state.new_values.top += this._state.offsetY;

        if(this.configs.autoUpdate){
            Object.entries(this._state.new_values).forEach(([key, value]) => {
                this.configs.target.css(key, `${value}px`);
            });
        }

        this.configs.target.triggerEvent('drag', {'behavior': this}, false, true);

        evt.stopPropagation();
        evt.preventDefault();
    }

    /**
     * The mouseup event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onMouseUp(evt){
        this.doc
            .removeListener('mousemove', this.onMouseMove)
            .removeListener('mouseup', this.onMouseUp);

        if(this._dragging){
            // prevent the upcoming click event from propagating
            this.doc.addOneTimeListener('click', this.onClick, true);

            Dom.removeClass(this.doc.get(0).body, bodyClassName);

            this.configs.target
                .removeClass('dragging')
                .triggerEvent('dragend', {'behavior': this}, false, true);

            delete this._dragging;
            delete this._state;

            evt.stopPropagation();
            evt.preventDefault();
        }
    }

    /**
    * The click event handler
    *
    * @private
    * @param {Event} evt The event object
    */
    onClick(evt){
        evt.stopPropagation();
        evt.preventDefault();
    }

    /**
    * Get the current state
    *
    * @return {Object} The state data
    */
    getState(){
        return this._state;
    }

    /**
    * Add a snap guide
    *
    * @param {String} axis The guide's axis (x or y)
    * @param {Integer} position The guide's pixel position relative to the viewport
    * @return {this}
    */
    addSnapGuide(axis, position){
        const exists = this._snap_guides.find((guide) => {
            return guide.data('axis') === axis && guide.data('position') === position;
        });

        if(!exists){
            const container = this.configs.snapGuideContainer || this.doc.find('body');
            const rect = container.get(0).getBoundingClientRect();
            const offsetX = rect.left;
            const offsetY = rect.top;

            const guide = new Dom('<div/>', {'class': `${guideClassName} snap-guide`})
                .data('axis', axis)
                .data('position', position)
                .hide()
                .appendTo(container);

            if(axis === 'y'){
                guide.css('top', `${position - offsetY}px`);
            }
            else{
                guide.css('left', `${position - offsetX}px`);
            }

            this._snap_guides.push(guide);
        }

        return this;
    }

    /**
    * Get the snap guides, optionally filtered by axis
    *
    * @param {String} [axis] The axis to filter guides by (x or y)
    * @return {Array} The available snap guides
    */
    getSnapGuides(axis){
        if(axis){
            return this._snap_guides.filter((guide) => {
                return guide.data('axis') === axis;
            });
        }

        return this._snap_guides;
    }

    /**
    * Snap the current state to the closes guide(s)
    *
    * @private
    * @return {this}
    */
    applySnap(){
        const state = this.getState();
        const min_distances = {};
        const closest = {};
        const rect = this.configs.target.get(0).getBoundingClientRect();
        const positions = {'x': [], 'y': []};

        Object.entries(this.configs.snapPositions).forEach(([axis, values]) => {
            switch(axis){
                case 'x':
                    values.forEach((position) => {
                        positions.x.push(rect.x + (rect.width * position) + state.offsetX);
                    });
                    break;

                case 'y':
                    values.forEach((position) => {
                        positions.y.push(rect.y + (rect.height * position) + state.offsetY);
                    });
                    break;
            }
        });

        this.getSnapGuides().forEach((guide) => {
            const axis = guide.data('axis');

            guide.hide();

            positions[axis].forEach((position) => {
                const diff = guide.data('position') - position;
                const distance = Math.abs(diff);
                if(distance <= this.configs.snapThreshold){
                    guide.show();

                    if(!(axis in min_distances) || distance < min_distances[axis]){
                        min_distances[axis] = distance;
                        closest[axis] = diff;
                    }
                }
            });
        });

        if('x' in closest){
            state.offsetX += closest.x;
            state.mouse.x += closest.x;
        }
        if('y' in closest){
            state.offsetY += closest.y;
            state.mouse.y += closest.y;
        }

        return this;
    }

    /**
    * Remove all snap guides
    *
    * @return {this}
    */
    clearSnapGudies(){
        this._snap_guides.forEach((guide) => {
            guide.remove();
        });

        this._snap_guides = [];

        return this;
    }

    /**
     * Enable the behavior
     *
     * @return {this}
     */
    enable(){
        this.configs.target.addClass(`draggable ${className}`);

        this.configs.handle
            .addClass('drag-handle')
            .addListener('mousedown', this.onMouseDown);

        return this;
    }

    /**
     * Disable the behavior
     *
     * @return {this}
     */
    disable(){
        this.configs.target.removeClass(`draggable ${className}`);

        this.configs.handle
            .removeClass('drag-handle')
            .removeListener('mousedown', this.onMouseDown);

        return this;
    }

    /**
     * Destroy the behavior
     *
     * @return {this}
     */
    destroy(){
        this
            .clearSnapGudies()
            .disable();

        this.configs.handle.removeListener('mousedown', this.onMouseDown);

        return this;
    }

}
