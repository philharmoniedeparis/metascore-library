import Component from '../Component';
import Dom from '../../core/Dom';
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
            'resizable': false,
            'properties': Object.assign({}, defaults.properties, {
                'type': {
                    'editable': false,
                    'getter': function(){
                        return this.constructor.getType();
                    }
                },
                'hidden': {
                    'field': {
                        'type': 'checkbox',
                        'label': Locale.t('player.component.Controller.hidden', 'Hidden?')
                    },
                    'getter': function(){
                        return this.data('hidden') === "true";
                    },
                    'setter': function(value){
                        this.data('hidden', value ? "true" : null);
                    }
                },
                'x': {
                    'field': {
                        'type': 'number',
                        'input': {
                            'spinDirection': 'vertical'
                        },
                        'label': Locale.t('player.component.Controller.x', 'X')
                    },
                    'getter': function(){
                        return parseInt(this.css('left'), 10);
                    },
                    'setter': function(value){
                        this.css('left', `${value}px`);
                    }
                },
                'y': {
                    'field': {
                        'type': 'number',
                        'input': {
                            'flipSpinButtons': true
                        },
                        'label': Locale.t('player.component.Controller.y', 'Y')
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
                    'field': {
                        'type': 'number',
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
                    'field': {
                        'type': 'border-radius',
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
     * Get the draggable behaviour's configuration
     *
     * @return {Object} The configuration
     */
    getDraggableConfigs(){
        return Object.assign(super.getDraggableConfigs(), {
            'handle': this.child('.timer')
        });
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
