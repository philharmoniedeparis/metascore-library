import Dom from '../Dom';

import {bodyClassName, className, guideClassName} from '../../../css/core/ui/Draggable.less';

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

        this.configs.handle.addListener('mousedown', this.onMouseDown);

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
            'snapTreshhold': 5
        };
    }

    /**
     * The mousedown event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onMouseDown(evt){
        if(!this.enabled){
            return;
        }

        if(!this.configs.target.triggerEvent('beforedrag', null, true, true)){
            return;
        }

        /**
         * The state at which the mouse was on last move
         * @type {Object}
         */
        this._state = {
            'x': evt.clientX,
            'y': evt.clientY
        };

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

        Dom.addClass(this.doc.get(0).body, bodyClassName);

        this.configs.target
            .addClass('dragging')
            .triggerEvent('dragstart', null, false, true);

        evt.stopPropagation();
        evt.preventDefault();
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

        let offsetX = clientX - this._state.x;
        let offsetY = clientY - this._state.y;

        this._state.x = clientX;
        this._state.y = clientY;

        // Apply snap
        const min_distances = {};
        const closest = {};
        const rect = this.configs.target.get(0).getBoundingClientRect();
        const positions = {
            'x': [
                rect.x + offsetX, //left
                rect.x + offsetX + rect.width / 2, // center
                rect.x + offsetX + rect.width, // right
            ],
            'y': [
                rect.y + offsetY, //top
                rect.y + offsetY + rect.height / 2, // center
                rect.y + offsetY + rect.height, // bottom
            ]
        };
        this.getSnapGuides().forEach((guide) => {
            const axis = guide.data('axis');

            guide.hide();

            positions[axis].forEach((position) => {
                const diff = guide.data('position') - position;
                const distance = Math.abs(diff);
                if(distance <= this.configs.snapTreshhold){
                    guide.show();

                    if(!(axis in min_distances) || distance < min_distances[axis]){
                        min_distances[axis] = distance;
                        closest[axis] = diff;
                    }
                }
            });
        });
        if('x' in closest){
            offsetX += closest.x;
            this._state.x += closest.x;
        }
        if('y' in closest){
            offsetY += closest.y;
            this._state.y += closest.y;
        }

        /**
         * Whether the target is being dragged
         * @type {Boolean}
         */
        this._dragged = true;

        this.configs.target.triggerEvent('drag', {'offsetX': offsetX, 'offsetY': offsetY}, false, true);

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

        // if a drag did occur, prevent the next click event from propagating
        if(this._dragged){
            delete this._dragged;
            this.doc.addOneTimeListener('click', this.onClick, true);
        }

        Dom.removeClass(this.doc.get(0).body, bodyClassName);

        this.configs.target
            .removeClass('dragging')
            .triggerEvent('dragend', null, false, true);

        delete this._state;

        evt.stopPropagation();
        evt.preventDefault();
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

    addSnapGuide(axis, position){
        const exists = this._snap_guides.find((guide) => {
            return guide.data('axis') === axis && guide.data('position') === position;
        });

        if(!exists){
            const guide = new Dom('<div/>', {'class': `${guideClassName} snap-guide`})
                .data('axis', axis)
                .data('position', position)
                .css(axis === 'y' ? 'top' : 'left', `${position}px`)
                .hide()
                .appendTo(this.doc.find('body'));

            this._snap_guides.push(guide);
        }

        return this;
    }

    getSnapGuides(axis){
        if(axis){
            return this._snap_guides.filter((guide) => {
                return guide.data('axis') === axis;
            });
        }

        return this._snap_guides;
    }

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

        this.configs.handle.addClass('drag-handle');

        /**
         * Whether the behavior is enabled
         * @type {Boolean}
         */
        this.enabled = true;

        return this;
    }

    /**
     * Disable the behavior
     *
     * @return {this}
     */
    disable(){
        this.configs.target.removeClass(`draggable ${className}`);

        this.configs.handle.removeClass('drag-handle');

        delete this.enabled;

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
