import Component from '../Component';
import Dom from '../../core/Dom';
import Draggable from '../../core/ui/Draggable';
import Locale from '../../core/Locale';
import {formatTime} from '../../core/utils/Media';

/**
 * A controller component
 */
export default class Controller extends Component{

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'properties': Object.assign({}, defaults.properties, {
                'type': {
                    'editable': false,
                    'getter': function(){
                        return this.constructor.getType();
                    }
                },
                'locked': {
                    'type': 'Checkbox',
                    'configs': {
                        'label': Locale.t('player.component.Controller.locked', 'Locked?')
                    },
                    'getter': function(){
                        return this.data('locked') === "true";
                    },
                    'setter': function(value){
                        this.data('locked', value ? "true" : null);
                    }
                },
                'x': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Controller.x', 'X'),
                        'spinDirection': 'vertical'
                    },
                    'getter': function(){
                        return parseInt(this.css('left'), 10);
                    },
                    'setter': function(value){
                        this.css('left', `${value}px`);
                    }
                },
                'y': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Controller.y', 'Y'),
                        'flipSpinButtons': true
                    },
                    'getter': function(){
                        return parseInt(this.css('top'), 10);
                    },
                    'setter': function(value){
                        this.css('top', `${value}px`);
                    }
                },
                'width': {
                    'editable': false,
                    'getter': function(){
                        return parseInt(this.css('width'), 10);
                    }
                },
                'height': {
                    'editable': false,
                    'getter': function(){
                        return parseInt(this.css('height'), 10);
                    }
                },
                'z-index': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Controller.z-index', 'Display index')
                    },
                    'getter': function(skipDefault){
                        const value = parseInt(this.css('z-index', void 0, skipDefault), 10);
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.css('z-index', value);
                    }
                },
                'border-radius': {
                    'type': 'BorderRadius',
                    'configs': {
                        'label': Locale.t('player.component.Controller.border-radius', 'Border radius')
                    },
                    'getter': function(skipDefault){
                        return this.css('border-radius', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.css('border-radius', value);
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
        return 'Controller';
    }

    /**
     * Setup the controller's UI
     *
     * @private
     */
    setupUI() {
        // call parent function
        super.setupUI();

        this.addClass('controller');

        /**
         * The timer container
         * @type {Dom}
         */
        this.timer = new Dom('<div/>', {'class': 'timer', 'text': '00:00.00'})
            .appendTo(this);

        /**
         * The rewind <button> element
         * @type {Dom}
         */
        this.rewind_btn = new Dom('<button/>')
            .data('action', 'rewind');

        /**
         * The play <button> element
         * @type {Dom}
         */
        this.play_btn = new Dom('<button/>')
            .addListener('keydown', this.onPlayBtnKeydown.bind(this))
            .data('action', 'play');

        new Dom('<div/>', {'class': 'buttons'})
            .append(this.rewind_btn)
            .append(this.play_btn)
            .appendTo(this);

        return this;
    }

    /**
     * Get the value of the controller's name property
     *
     * @return {String} The name
     */
    getName() {
        return '[controller]';
    }

    /**
     * Update the displayed time
     *
     * @param {Integer} time The time value in centiseconds
     * @return {this}
     */
    updateTime(time){
        this.timer.text(formatTime(time));

        return this;
    }

    /**
     * Set/Unset the draggable behaviour
     *
     * @param {Boolean} [draggable=true] Whether to activate or deactivate the draggable
     * @return {Draggable} The draggable behaviour
     */
    setDraggable(draggable){
        if(this.getPropertyValue('locked') && draggable){
            return false;
        }

        if(draggable && !this._draggable){
            /**
             * The draggable behavior
             * @type {Draggable}
             */
            this._draggable = new Draggable({
                'target': this,
                'handle': this.child('.timer')
            });
        }
        else if(!draggable && this._draggable){
            this._draggable.destroy();
            delete this._draggable;
        }

        return this._draggable;

    }

    /**
     * Play button keydown event callback
     *
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    onPlayBtnKeydown(evt){
        if(evt.key === " "){
            evt.stopPropagation();
        }
    }

}
