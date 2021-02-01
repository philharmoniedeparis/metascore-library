import Dom from '../Dom';

import {bodyClassName, className, guideClassName} from '../../../css/core/ui/Resizable.scss';

/**
 * A class for adding resizable behaviors
 *
 * @emits {beforeresize} Fired before the resize starts. The event bubbles allowing the resize to be canceled by invoking preventDefault
 * @emits {resizestart} Fired when a resize started
 * @emits {resize} Fired when a resize occured
 * @emits {resizeend} Fired when a resize ended
 */
export default class Resizable {

    static defaults = {
        'directions': [
            'top',
            'right',
            'bottom',
            'left',
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right'
        ],
        'autoUpdate': true,
        'snapGuideContainer': null,
        'snapThreshold': 5
    };

    /**
     * Instantiate
     *
     * @param {Dom} target The Dom object to add the behavior to
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} [directions={'top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'}] The directions at which a resize is allowed
     * @property {Boolean} [autoUpdate=true] Whether to update the size of the target automatically
     * @property {Dom} [snapGuideContainer=body] The Dom object to add snap guides to
     * @property {Number} [snapThreshold=5] The distance at which a snap guide attracts
     */
    constructor(target, configs) {
        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.defaults, configs);

        /**
         * The target element.
         * @type {Dom}
         */
        this.target = target;

        /**
         * Snap guides
         * @type {Array}
         */
        this._snap_guides = [];

        /**
         * A list of resize handles
         * @type {Object}
         */
        this.handles = {};

        // fix event handlers scope
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onClick = this.onClick.bind(this);

        this.configs.directions.forEach((direction) => {
            this.handles[direction] = new Dom('<div/>', {'class': 'resize-handle'})
                .data('direction', direction)
                .appendTo(this.target);
        });

        this.enable();
    }

    /**
     * The mousedown event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onMouseDown(evt){
        if(!this.target.triggerEvent('beforeresize', {'behavior': this}, true, true)){
            return;
        }

        /**
         * State data needed during resize
         * @type {Object}
         */
        this._state = {
            'direction': Dom.data(evt.target, 'direction'),
            'position': this.target.css('position'),
            'mouse': {
                'x': evt.clientX,
                'y': evt.clientY
            },
            'original_values': {
                'left': parseInt(this.target.css('left'), 10),
                'top': parseInt(this.target.css('top'), 10),
                'width': parseInt(this.target.css('width'), 10),
                'height': parseInt(this.target.css('height'), 10)
            },
            'new_values': {}
        };

        if(!this.doc){
            /**
             * The target's owner document
             * @type {Dom}
             */
            this.doc = new Dom(Dom.getElementDocument(this.target.get(0)));
        }

        this.doc
            .addListener('mousemove', this.onMouseMove)
            .addListener('mouseup', this.onMouseUp);

        Dom.addClass(this.doc.get(0).body, bodyClassName);

        this.target
            .addClass('resizing')
            .triggerEvent('resizestart', {'behavior': this}, false, true);

        evt.stopPropagation();
    }

    /**
     * The mousemove event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onMouseMove(evt){
        const clientX = evt.clientX;
        const clientY = evt.clientY;

        this._state.offsetX = clientX - this._state.mouse.x;
        this._state.offsetY = clientY - this._state.mouse.y;

        this._state.mouse.x = clientX;
        this._state.mouse.y = clientY;

        this.applySnap();

        // Update state values
        if(this._state.direction.includes('left')){
            if(!('width' in this._state.new_values)){
                this._state.new_values.width = this._state.original_values.width;
            }
            this._state.new_values.width -= this._state.offsetX;

            if(!('left' in this._state.new_values)){
                this._state.new_values.left = this._state.original_values.left;
            }
            this._state.new_values.left += this._state.offsetX;
        }
        else if(this._state.direction.includes('right')){
            if(!('width' in this._state.new_values)){
                this._state.new_values.width = this._state.original_values.width;
            }
            this._state.new_values.width += this._state.offsetX;
        }
        if(this._state.direction.includes('top')){
            if(!('height' in this._state.new_values)){
                this._state.new_values.height = this._state.original_values.height;
            }
            this._state.new_values.height -= this._state.offsetY;

            if(!('top' in this._state.new_values)){
                this._state.new_values.top = this._state.original_values.top;
            }
            this._state.new_values.top += this._state.offsetY;
        }
        else if(this._state.direction.includes('bottom')){
            if(!('height' in this._state.new_values)){
                this._state.new_values.height = this._state.original_values.height;
            }
            this._state.new_values.height += this._state.offsetY;
        }

        if(this.configs.autoUpdate){
            Object.entries(this._state.new_values).forEach(([key, value]) => {
                if(this._state.position !== 'absolute' && (key === 'top' || key === 'left')){
                    return;
                }

                this.target.css(key, `${value}px`);
            });
        }

        /**
         * Whether the target is being resized
         * @type {Boolean}
         */
        this._resized = true;

        this.target.triggerEvent('resize', {'behavior': this}, false, true);

        evt.stopPropagation();
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

        // if a resize did occur, prevent the next click event from propagating
        if(this._resized){
            delete this._resized;
            this.doc.addOneTimeListener('click', this.onClick, true);
        }

        Dom.removeClass(this.doc.get(0).body, bodyClassName);

        this.target
            .removeClass('resizing')
            .triggerEvent('resizeend', {'behavior': this}, false, true);

        delete this._state;

        evt.stopPropagation();
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
            return guide.data('axis') === axis && guide.data('position') === position.toString();
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
        const rect = this.target.get(0).getBoundingClientRect();
        const positions = {
            'x': [],
            'y': []
        };

        if(state.direction.includes('left')){
            positions.x.push(rect.x + state.offsetX);
        }
        else if(state.direction.includes('right')){
            positions.x.push(rect.x + rect.width + state.offsetX);
        }
        if(state.direction.includes('top')){
            positions.y.push(rect.y + state.offsetY);
        }
        else if(state.direction.includes('bottom')){
            positions.y.push(rect.y + rect.height + state.offsetY);
        }

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
     * Get all handles
     * @return {Object} The handles
     */
    getHandles(){
        return this.handles;
    }

    /**
     * Get a handle
     * @param {String} direction The direction of the handle to get
     * @return {Dom} The handle
     */
    getHandle(direction){
        return this.handles[direction];
    }

    /**
     * Enable the behavior
     *
     * @return {this}
     */
    enable() {
        this.target.addClass(`resizable ${className}`);

        if(this.handles){
            Object.values(this.handles).forEach((handle) => {
                handle.addListener('mousedown', this.onMouseDown);
            });
        }

        return this;
    }

    /**
     * Disable the behavior
     *
     * @return {this}
     */
    disable() {
        this.target.removeClass(`resizable ${className}`);

        if(this.handles){
            Object.values(this.handles).forEach((handle) => {
                handle.removeListener('mousedown', this.onMouseDown);
            });
        }

        return this;
    }

    /**
     * Destroy the behavior
     *
     * @return {this}
     */
    destroy() {
        this
            .clearSnapGudies()
            .disable();

        if(this.handles){
            Object.values(this.handles).forEach((handle) => {
                handle.remove();
            });
        }


        return this;
    }

}
