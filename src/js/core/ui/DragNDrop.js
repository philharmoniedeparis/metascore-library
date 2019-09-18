import Dom from '../Dom';
import {uuid} from '../utils/String';

/**
 * A class for adding drag'n'drop behaviors
 *
 * @emits {beforedrag} Fired before the drag starts. The event bubbles allowing the drag to be canceled by invoking preventDefault
 * @emits {dragstart} Fired when the drag started
 * @emits {drag} Fired when a drag occured
 * @emits {dragend} Fired when the drag ended
 *
 * @todo: move the position updating to this class, as is the case with the Resizable class
 */
export default class DragNDrop {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Dom} target The Dom object to add the behavior to
     */
    constructor(configs) {
        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        // fix event handlers scope
        this.onDragStart = this.onDragStart.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onDragTargetDragEnter = this.onDragTargetDragEnter.bind(this);
        this.onDragTargetDragOver = this.onDragTargetDragOver.bind(this);
        this.onDragTargetDragLeave = this.onDragTargetDragLeave.bind(this);

        this.drop_targets = [];

        this.enable();
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'image': {
                'offset_x': 0,
                'offset_y': 0,
                'src': null,
                'width': null,
            },
            'effectAllowed': 'move'
        };
    }

    onDragStart(evt){
        this.configs.target.addClass('dragging');

        evt.dataTransfer.effectAllowed = this.configs.effectAllowed;
        evt.dataTransfer.setData("text/plain", null);

        if(this.configs.image.src){
            const image = new Dom('<img/>', {'src': this.configs.image.src, 'width': this.configs.image.width});
            evt.dataTransfer.setDragImage(image.get(0), this.configs.image.offset_x, this.configs.image.offset_y);
        }
    }

    onDrag(evt){
        console.log(evt);
    }

    onDragEnd(){
        this.configs.target.removeClass('dragging');
    }

    addDropTarget(target){
        target
            .addClass('drop-target')
            .addListener('dragenter', this.onDragTargetDragEnter)
            .addListener('dragover', this.onDragTargetDragOver)
            .addListener('dragleave', this.onDragTargetDragLeave)
            .addListener('drop', this.onDragTargetDrop);
    }

    onDragTargetDragEnter(evt){
        Dom.addClass(evt.target, 'dragenter');
        console.log(evt);
    }

    onDragTargetDragOver(evt){
        evt.preventDefault();
    }

    onDragTargetDragLeave(evt){
        Dom.removeClass(evt.target, 'dragenter');
        console.log(evt);
    }

    onDragTargetDrop(evt){
        console.log(evt);
        evt.preventDefault();
    }

    /**
     * Enable the behavior
     *
     * @return {this}
     */
    enable(){
        if(this.enabled){
            return;
        }

        this.configs.target
            .attr('draggable', true)
            .data('dragdrop-id', uuid(10))
            .addListener('dragstart', this.onDragStart);

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
        if(!this.enabled){
            return;
        }

        this.configs.target
            .attr('draggable', null)
            .data('dragdrop-id', null)
            .removeListener('dragstart', this.onDragStart);

        delete this.enabled;

        return this;
    }

    /**
     * Destroy the behavior
     *
     * @return {this}
     */
    destroy(){
        this.disable();

        return this;
    }

}
